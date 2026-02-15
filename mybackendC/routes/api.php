<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);


Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    
    Route::post('petitions', [PetitionController::class, 'store']);
    Route::put('petitions/{id}', [PetitionController::class, 'update']);
    Route::delete('petitions/{id}', [PetitionController::class, 'destroy']);
});


Route::get('petitions', [PetitionController::class, 'index']);
Route::get('petitions/{id}', [PetitionController::class, 'show']);


Route::middleware('api')->post('refresh', [AuthController::class, 'refresh']);
