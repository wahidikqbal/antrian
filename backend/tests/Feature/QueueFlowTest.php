<?php

use App\Models\Loket;
use App\Models\QueueTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function queueCsrfGuardHeaderName(): string
{
    return (string) env('CSRF_GUARD_HEADER_NAME', 'X-CSRF-Guard');
}

function queueCsrfGuardHeaderValue(): string
{
    return (string) env('CSRF_GUARD_HEADER_VALUE', '1');
}

function queueTrustedFrontendOrigin(): string
{
    $configured = collect(explode(',', (string) env('TRUSTED_FRONTEND_ORIGINS', '')))
        ->map(fn (string $value) => trim($value))
        ->first(fn (string $value) => $value !== '');

    if (is_string($configured) && $configured !== '') {
        return $configured;
    }

    return (string) env('FRONTEND_URL', 'http://localhost:3000');
}

it('allows authenticated user to take queue ticket for a specific loket', function () {
    $user = User::factory()->create();
    $loket = Loket::query()->create([
        'name' => 'Dokter Gigi',
        'slug' => 'dokter-gigi',
        'code' => 'DG',
        'room_name' => 'Ruang 1',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);

    $response = $this
        ->withHeader('Origin', queueTrustedFrontendOrigin())
        ->withHeader(queueCsrfGuardHeaderName(), queueCsrfGuardHeaderValue())
        ->postJson('/api/kiosk/tickets', ['loket_slug' => $loket->slug]);

    $response
        ->assertCreated()
        ->assertJsonPath('ticket.ticket_no', 'DG-0001')
        ->assertJsonPath('ticket.status', QueueTicket::STATUS_WAITING);
});

it('allows assigned admin loket to call next queue', function () {
    $adminLoket = User::factory()->create(['role' => User::ROLE_ADMIN_LOKET]);
    $patient = User::factory()->create();
    $loket = Loket::query()->create([
        'name' => 'Dokter Umum',
        'slug' => 'dokter-umum',
        'code' => 'DU',
        'room_name' => 'Ruang 2',
        'is_active' => true,
    ]);
    $loket->admins()->attach($adminLoket->id);

    QueueTicket::query()->create([
        'loket_id' => $loket->id,
        'ticket_no' => 'DU-0001',
        'queue_date' => now()->toDateString(),
        'sequence_no' => 1,
        'queue_number' => 1,
        'status' => QueueTicket::STATUS_WAITING,
        'user_id' => $patient->id,
    ]);

    Sanctum::actingAs($adminLoket);

    $this
        ->withHeader('Origin', queueTrustedFrontendOrigin())
        ->withHeader(queueCsrfGuardHeaderName(), queueCsrfGuardHeaderValue())
        ->postJson("/api/admin-loket/{$loket->slug}/call-next")
        ->assertOk()
        ->assertJsonPath('ticket.status', QueueTicket::STATUS_SERVING);
});

it('forbids admin loket on unassigned loket', function () {
    $adminLoket = User::factory()->create(['role' => User::ROLE_ADMIN_LOKET]);
    $loket = Loket::query()->create([
        'name' => 'Dokter Anak',
        'slug' => 'dokter-anak',
        'code' => 'DA',
        'room_name' => 'Ruang 3',
        'is_active' => true,
    ]);

    Sanctum::actingAs($adminLoket);

    $this
        ->withHeader('Origin', queueTrustedFrontendOrigin())
        ->withHeader(queueCsrfGuardHeaderName(), queueCsrfGuardHeaderValue())
        ->postJson("/api/admin-loket/{$loket->slug}/call-next")
        ->assertForbidden();
});

it('allows superadmin to CRUD loket', function () {
    $superadmin = User::factory()->create(['role' => User::ROLE_SUPERADMIN]);
    Sanctum::actingAs($superadmin);

    $create = $this
        ->withHeader('Origin', queueTrustedFrontendOrigin())
        ->withHeader(queueCsrfGuardHeaderName(), queueCsrfGuardHeaderValue())
        ->postJson('/api/superadmin/lokets', [
            'name' => 'Dokter Saraf',
            'slug' => 'dokter-saraf',
            'code' => 'DS',
            'room_name' => 'Ruang 5',
            'is_active' => true,
        ]);

    $create->assertCreated();
    $loketSlug = (string) $create->json('slug');

    $this
        ->withHeader('Origin', queueTrustedFrontendOrigin())
        ->withHeader(queueCsrfGuardHeaderName(), queueCsrfGuardHeaderValue())
        ->putJson("/api/superadmin/lokets/{$loketSlug}", [
            'name' => 'Dokter Saraf Update',
            'slug' => 'dokter-saraf',
            'code' => 'DS',
            'room_name' => 'Ruang 6',
            'is_active' => true,
        ])
        ->assertOk()
        ->assertJsonPath('name', 'Dokter Saraf Update');
});
