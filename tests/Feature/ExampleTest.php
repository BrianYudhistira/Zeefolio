<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redirects root url to admin login for guests', function () {
    $response = $this->get('/');

    $response->assertRedirect('/admin/login');
});


