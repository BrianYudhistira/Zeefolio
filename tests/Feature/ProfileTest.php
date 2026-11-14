<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('account settings page is displayed', function () {
    $user = User::factory()->create([
        'username' => 'testuser',
    ]);

    $response = $this
        ->actingAs($user)
        ->get('/admin/account');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create([
        'username' => 'old_username',
    ]);

    $response = $this
        ->actingAs($user)
        ->from('/admin/account')
        ->post('/admin/account/profile', [
            'name' => 'Test User',
            'username' => 'test_user',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/admin/account');

    $user->refresh();

    $this->assertSame('Test User', $user->name);
    $this->assertSame('test_user', $user->username);
    $this->assertSame('test@example.com', $user->email);
    $this->assertNull($user->email_verified_at);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create([
        'username' => 'test_user',
    ]);

    $response = $this
        ->actingAs($user)
        ->from('/admin/account')
        ->post('/admin/account/profile', [
            'name' => 'Test User',
            'username' => 'test_user',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/admin/account');

    $this->assertNotNull($user->refresh()->email_verified_at);
});

test('user can delete their account', function () {
    $user = User::factory()->create([
        'role' => User::ROLE_MEMBER,
    ]);

    $response = $this
        ->actingAs($user)
        ->delete('/admin/account', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/admin/login');

    $this->assertGuest();
    $this->assertNull($user->fresh());
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/admin/account')
        ->delete('/admin/account', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/admin/account');

    $this->assertNotNull($user->fresh());
});

