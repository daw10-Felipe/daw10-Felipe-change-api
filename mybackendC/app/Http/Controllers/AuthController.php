<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    // Método para iniciar sesión. Valida el email y password, intenta loguear y si falla devuelve error 401. Si todo va bien, devuelve el token.
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        return $this->respondWithToken($token);
    }


    // Registro de nuevos usuarios. Valida los datos, crea el usuario en la BD y lo loguea automáticamente devolviendo el token.
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ], [
            'email.unique' => 'El correo ya tiene una cuenta creada',
            'email.required' => 'El correo es obligatorio',
            'email.email' => 'El formato del correo no es válido',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        $token = Auth::login($user);

        return $this->respondWithToken($token);
    }


    // Obtiene los datos del usuario autenticado actualmente usando el token.
    public function me()
    {
        return response()->json(Auth::user());
    }


    // Cierra la sesión del usuario invalidando el token actual.
    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Sesion cerrada correctamente'
        ]);
    }


    // Refresca el token de autenticación para que el usuario siga logueado sin tener que meter sus datos otra vez.
    public function refresh()
    {
        return $this->respondWithToken(Auth::refresh());
    }


    // Función auxiliar para formatear la respuesta JSON con el token generado.
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60
        ]);
    }
}
