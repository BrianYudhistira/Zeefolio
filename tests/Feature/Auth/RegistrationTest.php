<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration screen can be rendered', function () {
    $response = $this->get('/admin/register');

    $response->assertStatus(200);
});

test('new users can register and receive a default portfolio', function () {
    $response = $this->post('/admin/register', [
        'name' => 'Test User',
        'username' => 'test_user',
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
    $this->assertDatabaseHas('portfolio_users', [
        'slug' => 'test-user',
    ]);
});

