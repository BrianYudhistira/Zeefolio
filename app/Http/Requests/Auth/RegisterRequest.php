<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class RegisterRequest extends FormRequest
{
    /**
     * Normalize email and optional username before validation runs.
     */
    protected function prepareForValidation(): void
    {
        $updates = [];

        if ($this->has('email')) {
            $updates['email'] = Str::lower(trim((string) $this->input('email')));
        }

        if ($this->filled('username')) {
            $updates['username'] = trim((string) $this->input('username'));
        }

        if ($updates !== []) {
            $this->merge($updates);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['sometimes', 'nullable', 'string', 'max:60', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:2048'],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'username.alpha_dash' => 'Username may only contain letters, numbers, dashes, and underscores',
            'username.unique' => 'This username is already taken',
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already registered',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'photo.image' => 'File must be an image',
            'photo.max' => 'Image size must not exceed 2MB',
        ];
    }
}
