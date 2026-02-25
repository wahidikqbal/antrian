<?php

namespace App\Http\Controllers;

use App\Models\Loket;
use App\Models\QueueTicket;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SuperadminLoketController extends Controller
{
    public function index(): JsonResponse
    {
        $lokets = Loket::query()
            ->with(['admins:id,name,email,role'])
            ->orderBy('name')
            ->get();

        return response()->json($lokets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('lokets', 'slug')],
            'code' => ['required', 'string', 'max:16', Rule::unique('lokets', 'code')],
            'room_name' => ['nullable', 'string', 'max:120'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $loket = Loket::query()->create([
            'name' => $validated['name'],
            'slug' => strtolower($validated['slug']),
            'code' => strtoupper($validated['code']),
            'room_name' => $validated['room_name'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return response()->json($loket->load('admins:id,name,email,role'), 201);
    }

    public function update(Request $request, Loket $loket): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('lokets', 'slug')->ignore($loket->id)],
            'code' => ['required', 'string', 'max:16', Rule::unique('lokets', 'code')->ignore($loket->id)],
            'room_name' => ['nullable', 'string', 'max:120'],
            'is_active' => ['required', 'boolean'],
        ]);

        $loket->update([
            'name' => $validated['name'],
            'slug' => strtolower($validated['slug']),
            'code' => strtoupper($validated['code']),
            'room_name' => $validated['room_name'] ?? null,
            'is_active' => (bool) $validated['is_active'],
        ]);

        return response()->json($loket->fresh('admins:id,name,email,role'));
    }

    public function destroy(Loket $loket): JsonResponse
    {
        $loket->delete();

        return response()->json(['message' => 'Loket dihapus.']);
    }

    public function assignAdmin(Request $request, Loket $loket): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::query()->findOrFail((int) $validated['user_id']);
        if (! in_array($user->role, [User::ROLE_ADMIN_LOKET, User::ROLE_SUPERADMIN, User::ROLE_ADMIN], true)) {
            return response()->json(['message' => 'User bukan admin loket/superadmin.'], 422);
        }

        $loket->admins()->syncWithoutDetaching([$user->id]);

        return response()->json($loket->fresh('admins:id,name,email,role'));
    }

    public function removeAdmin(Loket $loket, User $user): JsonResponse
    {
        $loket->admins()->detach($user->id);

        return response()->json($loket->fresh('admins:id,name,email,role'));
    }

    public function report(Request $request): JsonResponse
    {
        $date = (string) ($request->query('date') ?: CarbonImmutable::now()->toDateString());

        $rows = Loket::query()
            ->select(['lokets.id', 'lokets.name', 'lokets.slug', 'lokets.code'])
            ->withCount([
                'queueTickets as waiting_count' => fn ($query) => $query
                    ->whereDate('queue_date', $date)
                    ->where('status', QueueTicket::STATUS_WAITING),
                'queueTickets as serving_count' => fn ($query) => $query
                    ->whereDate('queue_date', $date)
                    ->where('status', QueueTicket::STATUS_SERVING),
                'queueTickets as completed_count' => fn ($query) => $query
                    ->whereDate('queue_date', $date)
                    ->where('status', QueueTicket::STATUS_COMPLETED),
                'queueTickets as canceled_count' => fn ($query) => $query
                    ->whereDate('queue_date', $date)
                    ->where('status', QueueTicket::STATUS_CANCELED),
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'date' => $date,
            'lokets' => $rows,
        ]);
    }
}
