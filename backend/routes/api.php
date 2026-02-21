<?php

use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/me', [GoogleAuthController::class, 'me'])->middleware('auth:sanctum');
Route::post('/logout', [GoogleAuthController::class, 'logout']);
