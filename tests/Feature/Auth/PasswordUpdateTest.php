<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/admin/account')
        ->put('/admin/account/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/admin/account');

    $this->assertTrue(Hash::check('new-password-123', $user->refresh()->password));
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/admin/account')
        ->put('/admin/account/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/admin/account');
});

