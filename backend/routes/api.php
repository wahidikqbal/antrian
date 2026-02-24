<?php

use App\Http\Controllers\GoogleAuthController;
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
    ->middleware(['auth:sanctum', 'role:admin', 'throttle:auth-admin-overview', 'auth.monitor']);
Route::post('/logout', [GoogleAuthController::class, 'logout'])
    ->middleware(['auth:sanctum', 'trusted.frontend', 'csrf.guard', 'throttle:auth-logout', 'auth.monitor']);
