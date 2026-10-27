<?php

namespace App\Http\Requests\Portfolio;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePortfolioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation by decoding JSON string fields if sent via multipart/form-data.
     */
    protected function prepareForValidation(): void
    {
        foreach (['sections', 'home', 'about', 'projects', 'contacts'] as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $decoded = json_decode($value, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->merge([$field => $decoded]);
                }
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $portfolioId = $this->user()?->portfolioUser?->id;

        return [
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('portfolio_users', 'slug')->ignore($portfolioId),
            ],
            'theme' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],

            'sections' => ['nullable', 'array'],
            'home' => ['nullable', 'array'],
            'about' => ['nullable', 'array'],
            'projects' => ['nullable', 'array'],
            'contacts' => ['nullable', 'array'],

            // File uploads
            'about_image' => ['nullable', 'image', 'max:2048'],
            'about_cv' => ['nullable', 'mimes:pdf,doc,docx', 'max:5120'],
            'home_logo' => ['nullable', 'image', 'max:2048'],
            'project_images' => ['nullable', 'array'],
            'project_images.*' => ['image', 'max:2048'],
        ];
    }
}
