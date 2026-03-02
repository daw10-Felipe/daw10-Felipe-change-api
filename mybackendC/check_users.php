<?php
use App\Models\User;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = User::all();

if ($users->isEmpty()) {
    echo "No users found in the database.\n";
} else {
    echo "Users found:\n";
    foreach ($users as $user) {
        echo "ID: " . $user->id . " - Name: " . $user->name . " - Email: " . $user->email . "\n";
    }
}
