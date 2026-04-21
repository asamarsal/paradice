<?php

use App\Http\Controllers\Api\DiceRealtimeController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

Route::get('/rooms', [RoomController::class, 'index']);
Route::post('/rooms', [RoomController::class, 'create']);
Route::get('/rooms/{roomCode}', [RoomController::class, 'show'])
    ->where(['roomCode' => '[A-Za-z0-9\-]+' ]);
Route::post('/rooms/{roomCode}/join', [RoomController::class, 'join'])
    ->where(['roomCode' => '[A-Za-z0-9\-]+' ]);

Route::prefix('realtime/rooms/{roomId}')
    ->where(['roomId' => '[A-Za-z0-9\-\._]+'])
    ->group(function (): void {
        Route::get('/history', [DiceRealtimeController::class, 'history']);
        Route::post('/commit', [DiceRealtimeController::class, 'commit']);
        Route::post('/player-seed', [DiceRealtimeController::class, 'registerPlayerSeed']);
        Route::post('/roll', [DiceRealtimeController::class, 'roll']);
        Route::post('/reveal', [DiceRealtimeController::class, 'reveal']);
    });
