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
        Schema::create('tech_stack_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->timestamps();
        });

        Schema::create('tech_stacks', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('icon', 255)->nullable();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('tech_stack_categories')
                ->nullOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table->boolean('is_global')->default(false);
            $table->timestamps();

            $table->index(['is_global', 'user_id']);
        });

        Schema::create('project_tech_stack', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('tech_stack_id')->constrained('tech_stacks')->cascadeOnDelete();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['project_id', 'tech_stack_id']);
        });

        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->cascadeOnDelete();
            $table->foreignId('tech_stack_id')->constrained('tech_stacks')->cascadeOnDelete();
            $table->integer('proficiency_level')->default(1); // 1-5 scale
            $table->timestamps();

            $table->unique(['portfolio_user_id', 'tech_stack_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_skills');
        Schema::dropIfExists('project_tech_stack');
        Schema::dropIfExists('tech_stacks');
        Schema::dropIfExists('tech_stack_categories');
    }
};

