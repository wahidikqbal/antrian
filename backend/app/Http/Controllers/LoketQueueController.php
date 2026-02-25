<?php

namespace App\Http\Controllers;

use App\Events\QueueUpdated;
use App\Models\Loket;
use App\Models\QueueCallLog;
use App\Models\QueueTicket;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoketQueueController extends Controller
{
    public function myLokets(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->isSuperadmin()) {
            $lokets = Loket::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug', 'code', 'room_name']);
            return response()->json($lokets);
        }

        if (! $user->isAdminLoket()) {
            return response()->json([]);
        }

        $lokets = $user->lokets()->where('is_active', true)->orderBy('name')->get(['lokets.id', 'lokets.name', 'lokets.slug', 'lokets.code', 'lokets.room_name']);

        return response()->json($lokets);
    }

    public function snapshot(Request $request, Loket $loket): JsonResponse
    {
        if (! $this->canViewLoket($request->user(), $loket)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $today = CarbonImmutable::now()->toDateString();
        $serving = QueueTicket::query()
            ->with(['user:id,name', 'servedBy:id,name'])
            ->where('loket_id', $loket->id)
            ->whereDate('queue_date', $today)
            ->where('status', QueueTicket::STATUS_SERVING)
            ->orderBy('called_at')
            ->first();

        $waiting = QueueTicket::query()
            ->with(['user:id,name', 'servedBy:id,name'])
            ->where('loket_id', $loket->id)
            ->whereDate('queue_date', $today)
            ->where('status', QueueTicket::STATUS_WAITING)
            ->orderBy('sequence_no')
            ->get();

        $summary = QueueTicket::query()
            ->where('loket_id', $loket->id)
            ->whereDate('queue_date', $today)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END), 0) AS waiting_count,
                COALESCE(SUM(CASE WHEN status = 'serving' THEN 1 ELSE 0 END), 0) AS serving_count,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_count
            ")
            ->first();

        $latestCall = QueueCallLog::query()
            ->with('queueTicket:id,ticket_no')
            ->where('loket_id', $loket->id)
            ->latest('called_at')
            ->first();

        return response()->json([
            'loket' => [
                'id' => $loket->id,
                'name' => $loket->name,
                'slug' => $loket->slug,
                'code' => $loket->code,
                'room_name' => $loket->room_name,
            ],
            'date' => $today,
            'serving' => $serving ? $this->ticketPayload($serving) : null,
            'waiting' => $waiting->map(fn (QueueTicket $ticket): array => $this->ticketPayload($ticket)),
            'summary' => [
                'waiting_count' => (int) ($summary?->waiting_count ?? 0),
                'serving_count' => (int) ($summary?->serving_count ?? 0),
                'completed_count' => (int) ($summary?->completed_count ?? 0),
            ],
            'latest_call' => $latestCall ? [
                'ticket_no' => $latestCall->queueTicket?->ticket_no,
                'voice_text' => $latestCall->voice_text,
                'called_at' => $latestCall->called_at,
            ] : null,
        ]);
    }

    public function callNext(Request $request, Loket $loket): JsonResponse
    {
        $user = $request->user();
        if (! $this->canManageLoket($user, $loket)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $today = CarbonImmutable::now()->toDateString();

        $currentlyServing = QueueTicket::query()
            ->where('loket_id', $loket->id)
            ->whereDate('queue_date', $today)
            ->where('status', QueueTicket::STATUS_SERVING)
            ->first();

        if ($currentlyServing) {
            return $this->callTicketNow($loket, $currentlyServing, $user?->id, true);
        }

        $ticket = QueueTicket::query()
            ->where('loket_id', $loket->id)
            ->whereDate('queue_date', $today)
            ->where('status', QueueTicket::STATUS_WAITING)
            ->orderBy('sequence_no')
            ->first();

        if (! $ticket) {
            return response()->json(['message' => 'Tidak ada antrian menunggu.'], 422);
        }

        return $this->callTicketNow($loket, $ticket, $user?->id, false);
    }

    public function callTicket(Request $request, Loket $loket, QueueTicket $queueTicket): JsonResponse
    {
        $user = $request->user();
        if (! $this->canManageLoket($user, $loket)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $today = CarbonImmutable::now()->toDateString();
        if ($queueTicket->loket_id !== $loket->id) {
            return response()->json(['message' => 'Ticket tidak sesuai loket.'], 422);
        }

        if ($queueTicket->queue_date?->toDateString() !== $today) {
            return response()->json(['message' => 'Hanya tiket hari ini yang bisa dipanggil.'], 422);
        }

        $isRecall = $queueTicket->status === QueueTicket::STATUS_SERVING;
        if (! in_array($queueTicket->status, [QueueTicket::STATUS_WAITING, QueueTicket::STATUS_SERVING], true)) {
            return response()->json(['message' => 'Status tiket tidak bisa dipanggil.'], 422);
        }

        if ($queueTicket->status === QueueTicket::STATUS_WAITING) {
            $otherServing = QueueTicket::query()
                ->where('loket_id', $loket->id)
                ->whereDate('queue_date', $today)
                ->where('status', QueueTicket::STATUS_SERVING)
                ->where('id', '!=', $queueTicket->id)
                ->first();

            if ($otherServing) {
                // Replace current serving ticket with selected waiting ticket.
                $otherServing->update([
                    'status' => QueueTicket::STATUS_WAITING,
                    'completed_at' => null,
                ]);

                $otherServingFresh = $otherServing->fresh(['user:id,name', 'servedBy:id,name', 'loket:id,slug']);
                QueueUpdated::dispatch($otherServingFresh, 'status_changed');
            }
        }

        return $this->callTicketNow($loket, $queueTicket, $user?->id, $isRecall);
    }

    private function callTicketNow(Loket $loket, QueueTicket $ticket, ?int $userId, bool $isRecall): JsonResponse
    {
        $ticket->update([
            'status' => QueueTicket::STATUS_SERVING,
            'called_at' => now(),
            'called_by' => $userId,
            'served_by' => $userId,
            'called_count' => $ticket->called_count + 1,
        ]);

        $voiceText = $this->buildVoiceText($ticket, $loket);

        QueueCallLog::query()->create([
            'queue_ticket_id' => $ticket->id,
            'loket_id' => $loket->id,
            'called_by' => $userId,
            'called_at' => now(),
            'voice_text' => $voiceText,
        ]);

        $freshTicket = $ticket->fresh(['user:id,name', 'servedBy:id,name', 'loket:id,slug']);
        QueueUpdated::dispatch($freshTicket, $isRecall ? 'recalled' : 'called', $voiceText);

        return response()->json([
            'message' => $isRecall ? 'Panggilan diulang.' : 'Antrian berhasil dipanggil.',
            'voice_text' => $voiceText,
            'ticket' => $this->ticketPayload($freshTicket),
        ]);
    }

    private function buildVoiceText(QueueTicket $ticket, Loket $loket): string
    {
        $ticketSpeech = $this->toIndonesianSpeech((string) $ticket->ticket_no, true);
        $loketSpeech = $this->toIndonesianSpeech((string) $loket->name, false);

        return sprintf(
            'Nomor antrian %s, silakan menuju loket %s.',
            $ticketSpeech,
            $loketSpeech
        );
    }

    private function toIndonesianSpeech(string $text, bool $forceSpell): string
    {
        $lower = strtolower(trim($text));
        $normalized = preg_replace('/\s+/', ' ', $lower) ?? $lower;

        if (! $forceSpell && str_contains($normalized, ' ') && preg_match('/^[a-z\s]+$/', $normalized) === 1) {
            return $normalized;
        }

        $charMap = [
            'a' => 'a',
            'b' => 'be',
            'c' => 'ce',
            'd' => 'de',
            'e' => 'e',
            'f' => 'ef',
            'g' => 'ge',
            'h' => 'ha',
            'i' => 'i',
            'j' => 'je',
            'k' => 'ka',
            'l' => 'el',
            'm' => 'em',
            'n' => 'en',
            'o' => 'o',
            'p' => 'pe',
            'q' => 'kiu',
            'r' => 'er',
            's' => 'es',
            't' => 'te',
            'u' => 'u',
            'v' => 've',
            'w' => 'we',
            'x' => 'eks',
            'y' => 'ye',
            'z' => 'zet',
            '0' => 'nol',
            '1' => 'satu',
            '2' => 'dua',
            '3' => 'tiga',
            '4' => 'empat',
            '5' => 'lima',
            '6' => 'enam',
            '7' => 'tujuh',
            '8' => 'delapan',
            '9' => 'sembilan',
        ];

        $chars = preg_split('//u', $normalized, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $spoken = [];

        foreach ($chars as $char) {
            if (isset($charMap[$char])) {
                $spoken[] = $charMap[$char];
                continue;
            }

            if (in_array($char, [' ', '-', '_', '/'], true)) {
                $spoken[] = ' ';
                continue;
            }

            $spoken[] = $char;
        }

        $joined = trim(preg_replace('/\s+/', ' ', implode(' ', $spoken)) ?? '');

        return $joined !== '' ? $joined : $text;
    }

    public function setStatus(Request $request, Loket $loket, QueueTicket $queueTicket): JsonResponse
    {
        $user = $request->user();
        if (! $this->canManageLoket($user, $loket)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($queueTicket->loket_id !== $loket->id) {
            return response()->json(['message' => 'Ticket tidak sesuai loket.'], 422);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:waiting,serving,completed,canceled'],
        ]);

        $status = (string) $validated['status'];

        if ($status === QueueTicket::STATUS_SERVING) {
            $otherServing = QueueTicket::query()
                ->where('loket_id', $loket->id)
                ->whereDate('queue_date', $queueTicket->queue_date)
                ->where('status', QueueTicket::STATUS_SERVING)
                ->where('id', '!=', $queueTicket->id)
                ->exists();

            if ($otherServing) {
                return response()->json(['message' => 'Sudah ada antrian lain yang sedang dilayani.'], 422);
            }
        }

        $queueTicket->status = $status;
        $queueTicket->served_by = $user?->id;
        if ($status === QueueTicket::STATUS_SERVING) {
            $queueTicket->called_at = now();
        }
        if (in_array($status, [QueueTicket::STATUS_COMPLETED, QueueTicket::STATUS_CANCELED], true)) {
            $queueTicket->completed_at = now();
        }
        $queueTicket->save();

        $freshTicket = $queueTicket->fresh(['user:id,name', 'servedBy:id,name', 'loket:id,slug']);
        QueueUpdated::dispatch($freshTicket, 'status_changed');

        return response()->json([
            'message' => 'Status antrian diperbarui.',
            'ticket' => $this->ticketPayload($freshTicket),
        ]);
    }

    private function canViewLoket(?User $user, Loket $loket): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->isSuperadmin()) {
            return true;
        }

        if ($user->isAdminLoket()) {
            return $user->lokets()->whereKey($loket->id)->exists();
        }

        return true;
    }

    private function canManageLoket(?User $user, Loket $loket): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->isSuperadmin()) {
            return true;
        }

        if (! $user->isAdminLoket()) {
            return false;
        }

        return $user->lokets()->whereKey($loket->id)->exists();
    }

    private function ticketPayload(QueueTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'ticket_no' => $ticket->ticket_no,
            'sequence_no' => $ticket->sequence_no,
            'status' => $ticket->status,
            'called_at' => $ticket->called_at,
            'completed_at' => $ticket->completed_at,
            'created_at' => $ticket->created_at,
            'user' => $ticket->relationLoaded('user') ? [
                'id' => $ticket->user?->id,
                'name' => $ticket->user?->name,
            ] : null,
            'served_by' => $ticket->relationLoaded('servedBy') ? [
                'id' => $ticket->servedBy?->id,
                'name' => $ticket->servedBy?->name,
            ] : null,
        ];
    }
}
