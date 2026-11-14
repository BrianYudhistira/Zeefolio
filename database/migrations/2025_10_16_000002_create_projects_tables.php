<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->index();
            $table->boolean('is_global')->default(false)->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // Seed default global project categories
        $now = now();
        DB::table('project_categories')->insert([
            ['name' => 'Website', 'slug' => 'website', 'is_global' => true, 'user_id' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mobile', 'slug' => 'mobile', 'is_global' => true, 'user_id' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Backend', 'slug' => 'backend', 'is_global' => true, 'user_id' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Other', 'slug' => 'other', 'is_global' => true, 'user_id' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->cascadeOnDelete();
            $table->string('type', 50)->default('personal');
            $table->string('title', 255);
            $table->text('description');
            $table->string('image_path')->nullable();
            $table->string('slug')->unique();
            $table->string('demo_url')->nullable();
            $table->string('source_url')->nullable();
            $table->json('tech_stack');
            $table->string('project_type', 100)->nullable()->default('website');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->json('image_path');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('portfolio_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->cascadeOnDelete();
            $table->string('page', 60)->default('home');
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('viewed_at')->useCurrent()->index();

            $table->index(['portfolio_user_id', 'viewed_at'], 'portfolio_views_user_time_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_views');
        Schema::dropIfExists('project_images');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('project_categories');
    }
};

