<?php

use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\KioskQueueController;
use App\Http\Controllers\LoketQueueController;
use App\Http\Controllers\SuperadminLoketController;
use Illuminate\Support\Facades\Route;

Route::get('/me', [GoogleAuthController::class, 'me'])
    ->middleware(['auth:sanctum', 'throttle:auth-me', 'auth.monitor']);
Route::get('/auth/session', [GoogleAuthController::class, 'session'])
    ->middleware(['auth:sanctum', 'throttle:auth-session', 'auth.monitor']);
Route::post('/auth/refresh', [GoogleAuthController::class, 'refresh'])
    ->middleware(['auth:sanctum', 'trusted.frontend', 'csrf.guard', 'throttle:auth-refresh', 'auth.monitor']);
Route::get('/me/activity', [GoogleAuthController::class, 'myActivity'])
    ->middleware(['auth:sanctum', 'throttle:auth-activity', 'auth.monitor']);
Route::get('/admin/overview', [GoogleAuthController::class, 'adminOverview'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'throttle:auth-admin-overview', 'auth.monitor']);
Route::post('/logout', [GoogleAuthController::class, 'logout'])
    ->middleware(['auth:sanctum', 'trusted.frontend', 'csrf.guard', 'throttle:auth-logout', 'auth.monitor']);

Route::get('/lokets', [KioskQueueController::class, 'lokets'])
    ->middleware(['auth:sanctum', 'throttle:queue-read']);
Route::post('/kiosk/tickets', [KioskQueueController::class, 'takeTicket'])
    ->middleware(['auth:sanctum', 'trusted.frontend', 'csrf.guard', 'throttle:queue-write']);
Route::get('/lokets/{loket}/snapshot', [LoketQueueController::class, 'snapshot'])
    ->middleware(['auth:sanctum', 'throttle:queue-read', 'queue.snapshot.monitor']);
Route::get('/admin-loket/lokets', [LoketQueueController::class, 'myLokets'])
    ->middleware(['auth:sanctum', 'role:admin_loket,superadmin,admin', 'throttle:queue-read']);
Route::post('/admin-loket/{loket}/call-next', [LoketQueueController::class, 'callNext'])
    ->middleware(['auth:sanctum', 'role:admin_loket,superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::post('/admin-loket/{loket}/tickets/{queueTicket}/call', [LoketQueueController::class, 'callTicket'])
    ->middleware(['auth:sanctum', 'role:admin_loket,superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::post('/admin-loket/{loket}/tickets/{queueTicket}/status', [LoketQueueController::class, 'setStatus'])
    ->middleware(['auth:sanctum', 'role:admin_loket,superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);

Route::get('/superadmin/lokets', [SuperadminLoketController::class, 'index'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'throttle:auth-admin-overview']);
Route::post('/superadmin/lokets', [SuperadminLoketController::class, 'store'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::put('/superadmin/lokets/{loket}', [SuperadminLoketController::class, 'update'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::delete('/superadmin/lokets/{loket}', [SuperadminLoketController::class, 'destroy'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::post('/superadmin/lokets/{loket}/admins', [SuperadminLoketController::class, 'assignAdmin'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::delete('/superadmin/lokets/{loket}/admins/{user}', [SuperadminLoketController::class, 'removeAdmin'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'trusted.frontend', 'csrf.guard', 'throttle:queue-admin-action']);
Route::get('/superadmin/reports/queues', [SuperadminLoketController::class, 'report'])
    ->middleware(['auth:sanctum', 'role:superadmin,admin', 'throttle:auth-admin-overview']);
