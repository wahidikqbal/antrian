<?php

namespace App\Http\Controllers;

use App\Events\QueueUpdated;
use App\Models\Loket;
use App\Models\QueueSequence;
use App\Models\QueueTicket;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KioskQueueController extends Controller
{
    public function lokets(): JsonResponse
    {
        $lokets = Loket::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'code', 'room_name']);

        return response()->json($lokets);
    }

    public function takeTicket(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'loket_slug' => ['required', 'string', 'exists:lokets,slug'],
        ]);

        $user = $request->user();
        $today = CarbonImmutable::now()->toDateString();
        $loket = Loket::query()->where('slug', $validated['loket_slug'])->firstOrFail();

        $attempt = 0;

        do {
            $attempt++;

            try {
                $ticket = DB::transaction(function () use ($loket, $today, $user): QueueTicket {
                    $sequence = QueueSequence::query()
                        ->where('loket_id', $loket->id)
                        ->whereDate('queue_date', $today)
                        ->lockForUpdate()
                        ->first();

                    if (! $sequence) {
                        $sequence = QueueSequence::query()->create([
                            'loket_id' => $loket->id,
                            'queue_date' => $today,
                            'last_no' => 0,
                        ]);
                        $sequence->refresh();
                    }

                    $nextNumber = $sequence->last_no + 1;
                    $sequence->update(['last_no' => $nextNumber]);

                    return QueueTicket::query()->create([
                        'loket_id' => $loket->id,
                        'ticket_no' => $loket->code.'-'.str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT),
                        'queue_date' => $today,
                        'sequence_no' => $nextNumber,
                        'queue_number' => $nextNumber,
                        'status' => QueueTicket::STATUS_WAITING,
                        'user_id' => $user?->id,
                    ]);
                });

                $ticket->loadMissing('loket:id,name,slug,code');
                QueueUpdated::dispatch($ticket, 'created');

                return response()->json([
                    'message' => 'Nomor antrian berhasil diambil.',
                    'ticket' => $this->ticketPayload($ticket),
                ], 201);
            } catch (QueryException $exception) {
                if ($attempt < 5 && $exception->getCode() === '23000') {
                    continue;
                }

                throw $exception;
            }
        } while ($attempt < 5);

        return response()->json(['message' => 'Gagal membuat nomor antrian.'], 500);
    }

    private function ticketPayload(QueueTicket $ticket): array
    {
        return [
            'id' => $ticket->id,
            'ticket_no' => $ticket->ticket_no,
            'queue_date' => $ticket->queue_date?->toDateString(),
            'sequence_no' => $ticket->sequence_no,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at,
            'loket' => $ticket->relationLoaded('loket') ? [
                'id' => $ticket->loket?->id,
                'name' => $ticket->loket?->name,
                'slug' => $ticket->loket?->slug,
                'code' => $ticket->loket?->code,
            ] : null,
        ];
    }
}
