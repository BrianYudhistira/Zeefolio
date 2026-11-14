<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('portfolio_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('sections')->nullable();
            $table->string('theme', 50)->default('default');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('home', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->cascadeOnDelete();
            $table->string('greeting', 255);
            $table->string('name', 255);
            $table->json('passions')->nullable();
            $table->text('description');
            $table->string('logo_path')->nullable();
            $table->string('image_path')->nullable();
            $table->string('cv_path')->nullable();
            $table->json('social_media_links')->nullable();
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->cascadeOnDelete();
            $table->string('email');
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->cascadeOnDelete();
            $table->string('company', 255);
            $table->string('position', 255);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('certificate_path')->nullable();
            $table->text('description');
            $table->string('tech_stack')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('home');
        Schema::dropIfExists('portfolio_users');
    }
};

