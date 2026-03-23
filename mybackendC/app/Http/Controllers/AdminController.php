<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Petition;
use App\Models\PetitionImage;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{


    public function indexUsers()
    {
        $users = User::withCount('petitions')->get();
        return response()->json($users);
    }

    public function showUser(string $id)
    {
        $user = User::withCount('petitions')->findOrFail($id);
        return response()->json($user);
    }

    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'rol_id' => 'sometimes|integer|in:0,1',
        ]);

        $data = $request->only('name', 'email', 'rol_id');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json($user);
    }

    public function destroyUser(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    

    public function indexPetitions()
    {
        $petitions = Petition::with(['user', 'images'])
            ->withCount('signerUsers as signers_count')
            ->get();
        return response()->json($petitions);
    }

    public function showPetition(string $id)
    {
        $petition = Petition::with(['user', 'images'])
            ->withCount('signerUsers as signers_count')
            ->findOrFail($id);
        return response()->json($petition);
    }

    public function updatePetition(Request $request, string $id)
    {
        \Illuminate\Support\Facades\Log::info('Update Petition Payload', $request->all());
        $petition = Petition::findOrFail($id);

        if ($request->has('status')) {
            $request->merge(['status' => strtolower($request->status)]);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'nullable|string|max:100',
            'status' => 'sometimes|string|in:active,closed,pending',
            'images' => 'nullable|array',
            'images.*' => 'image|max:10240',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer',
        ]);

        $petition->update($request->only('title', 'description', 'category', 'status'));

        if ($request->has('delete_images')) {
            $toDelete = PetitionImage::whereIn('id', $request->delete_images)
                ->where('petition_id', $petition->id)
                ->get();

            foreach ($toDelete as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->images()->create(['path' => $path]);
            }
        }

        return response()->json($petition->load(['user', 'images']));
    }

    public function destroyPetition(string $id)
    {
        $petition = Petition::findOrFail($id);

        foreach ($petition->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $petition->delete();
        return response()->json(['message' => 'Petición eliminada correctamente']);
    }

    

    public function indexCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        $category = Category::create($request->only('name'));
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name,' . $id,
        ]);

        $oldName = $category->name;
        $newName = $request->name;

        $category->update(['name' => $newName]);

        if ($oldName !== $newName) {
            Petition::where('category', $oldName)->update(['category' => $newName]);
        }

        return response()->json($category);
    }

    public function destroyCategory(string $id)
    {
        $category = Category::findOrFail($id);

        Petition::where('category', $category->name)->update(['category' => null]);

        $category->delete();
        return response()->json(['message' => 'Categoría eliminada correctamente']);
    }

    

    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_petitions' => Petition::count(),
            'total_categories' => Category::count(),
            'active_petitions' => Petition::where('status', 'active')->count(),
        ]);
    }
}
