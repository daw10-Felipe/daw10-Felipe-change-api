<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Login y generacion del token JWT
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (! $token = Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    // Registro de usuario
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            // NOTA: Como en User.php tienes 'password' => 'hashed',
            // no hace falta usar Hash::make() aquí, Laravel lo hace solo.
            'password' => $request->password,
        ]);

        $token = Auth::login($user);

        return $this->respondWithToken($token);
    }


    public function userProfile()
    {
        return response()->json(Auth::user());
    }

    // Logout (invalida el token)
    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Sesion cerrada correctamente'
        ]);
    }

    // Refrescar token
    public function refresh()
    {
        return $this->respondWithToken(Auth::refresh());
    }

    // Respuesta estandar con token
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60
        ]);
    }
}
