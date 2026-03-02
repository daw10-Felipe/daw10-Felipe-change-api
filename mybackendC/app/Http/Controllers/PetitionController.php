<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Petition;
use App\Models\PetitionImage;
use Illuminate\Support\Facades\Storage;

class PetitionController extends Controller
{
    // Lista todas las peticiones y carga el usuario creador y sus imágenes.
    public function index()
    {
        return response()->json(Petition::with(['user', 'images'])->get());
    }

    // Crea una nueva petición. Acepta varias imágenes en el campo images[].
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'images'      => 'nullable|array',
            'images.*'    => 'image|max:2048',
        ]);

        $data = $request->only('title', 'description');
        $petition = $request->user()->petitions()->create($data);

        // Guarda cada imagen y crea su registro en petition_images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->images()->create(['path' => $path]);
            }
        }

        return response()->json($petition->load('images'), 201);
    }

    // Muestra el detalle de una petición con su usuario e imágenes.
    public function show(string $id)
    {
        $petition = Petition::with(['user', 'images'])->findOrFail($id);
        return response()->json($petition);
    }

    // Actualiza una petición. Permite añadir imágenes nuevas y borrar las existentes.
    public function update(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);

        if ($request->user()->id !== $petition->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'          => 'sometimes|string|max:255',
            'description'    => 'sometimes|string',
            'images'         => 'nullable|array',
            'images.*'       => 'image|max:10240',
            'delete_images'  => 'nullable|array',
            'delete_images.*'=> 'integer',
        ]);

        $petition->update($request->only('title', 'description'));

        // Eliminar las imágenes marcadas para borrar
        if ($request->has('delete_images')) {
            $toDelete = PetitionImage::whereIn('id', $request->delete_images)
                ->where('petition_id', $petition->id)
                ->get();

            foreach ($toDelete as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }

        // Añadir las imágenes nuevas
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->images()->create(['path' => $path]);
            }
        }

        return response()->json($petition->load('images'));
    }

    // Elimina una petición y sus imágenes del servidor.
    public function destroy(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);

        if ($request->user()->id !== $petition->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Borrar ficheros de storage antes de eliminar la petición
        foreach ($petition->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $petition->delete();

        return response()->json(['message' => 'Petition deleted']);
    }
}
