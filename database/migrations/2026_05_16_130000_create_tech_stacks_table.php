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
            $table->timestamps();
        });

        Schema::create('project_tech_stack', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('tech_stack_id')->constrained('tech_stacks')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['project_id', 'tech_stack_id']);
        });

        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->onDelete('cascade');
            $table->foreignId('tech_stack_id')->constrained('tech_stacks')->onDelete('cascade');
            $table->integer('proficiency_level')->default(1); // 1-5 scale
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_tech_stack');
        Schema::dropIfExists('user_skills');
        Schema::dropIfExists('tech_stacks');
        Schema::dropIfExists('tech_stack_categories');
    }
};
