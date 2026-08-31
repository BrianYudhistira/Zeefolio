<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\PortfolioService;
use App\Models\PortfolioSetting;
use App\Http\Requests\Portfolio\UpdatePortfolioRequest;

class PortfolioController
{
    public function __construct(
        protected PortfolioService $portfolioService
    ) {}
    
    public function getPortfolioByUserId(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $portfolio = $this->portfolioService->getPortfolio($user);

        if (!$portfolio) {
            return response()->json(['message' => 'Portfolio not found'], 404);
        }

        return response()->json($portfolio, 200);
    }

    public function getPortfolioHome(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $homeSection = $this->portfolioService->getHomeSection($user);

        if (!$homeSection) {
            return response()->json(['message' => 'Home section not found'], 404);
        }

        return response()->json($homeSection, 200);
    }

    public function getPortfolioAbout(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $aboutSection = $this->portfolioService->getAboutSection($user);

        if (!$aboutSection) {
            return response()->json(['message' => 'About section not found'], 404);
        }

        return response()->json($aboutSection, 200);
    }

    public function getLogo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get 'logo' setting from portfolio settings
        $logoSetting = PortfolioSetting::where('name', 'logo')->first();

        if (!$logoSetting) {
            return response()->json(['message' => 'Logo setting not found'], 404);
        }

        return response()->json([
            'id' => $logoSetting->id,
            'name' => $logoSetting->name,
            'path' => $logoSetting->path,
            'value' => $logoSetting->value,
            'file_url' => $logoSetting->file_url
        ], 200);
    }

    public function editPortfolioFormData(UpdatePortfolioRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            // Get validated data
            $data = $request->validated();
            
            // Decode JSON strings from form-data (if they are strings)
            if (isset($data['sections']) && is_string($data['sections'])) {
                $data['sections'] = json_decode($data['sections'], true);
            }
            if (isset($data['home']) && is_string($data['home'])) {
                $data['home'] = json_decode($data['home'], true);
            }
            if (isset($data['about']) && is_string($data['about'])) {
                $data['about'] = json_decode($data['about'], true);
            }
            if (isset($data['projects']) && is_string($data['projects'])) {
                $data['projects'] = json_decode($data['projects'], true);
            }
            if (isset($data['contacts']) && is_string($data['contacts'])) {
                $data['contacts'] = json_decode($data['contacts'], true);
            }

            $files = [
                'about_image' => $request->file('about_image'),
                'about_cv' => $request->file('about_cv'),
                'project_images' => $request->file('project_images'),
                'home_logo' => $request->file('home_logo'),
            ];

            $portfolio = $this->portfolioService->createOrUpdatePortfolio(
                $user,
                $data,
                $files
            );

            return response()->json([
                'message' => 'Portfolio updated successfully',
                'data' => $portfolio
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update portfolio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function editPortfolioJsonData(UpdatePortfolioRequest $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            $portfolio = $this->portfolioService->createOrUpdatePortfolio(
                $user,
                $request->validated(),
                []
            );

            return response()->json([
                'message' => 'Portfolio updated successfully',
                'data' => $portfolio
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update portfolio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteportfolio(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $password = $request->validate([
            'password' => 'required|string',
        ]);
        
        if (!Hash::check($password['password'], $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 403);
        }

        $portfolio = $user->portfolioUser()->first();
        if (!$portfolio) {
            return response()->json(['message' => 'Portfolio not found'], 404);
        }

        $this->portfolioService->deletePortfolio($portfolio);

        return response()->json(['message' => 'Portfolio deleted successfully'], 200);
    }

    public function editHome(Request $request)
    {
        $content = $request->validate([
            'greeting' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'passions' => 'nullable|array',
            'passions.*' => 'string|max:100',
            'description' => 'nullable|string',
            'logo'=>'nullable|image|max:2048',
        ]);


        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $portfolio = $user->portfolioUser()->first();
        if (!$portfolio) {
            return response()->json(['message' => 'Portfolio not found'], 404);
        }

        $logoPath = null;

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            if ($portfolio->home->logo_path){
                Storage::disk('public')->delete($portfolio->home->logo_path);
            }
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $logoPath = $file->storeAs("logos/{$user->id}", $filename, 'public');
        }

        $portfolio->home->update([
            'greeting' => $content['greeting'] ?? $portfolio->home->greeting,
            'name' => $content['name'] ?? $portfolio->home->name,
            'passions' => $content['passions'] ?? $portfolio->home->passions,
            'description' => $content['description'] ?? $portfolio->home->description,
            'logo_path' => $logoPath ?? $portfolio->home->logo_path,
        ]);

        return response()->json(['message' => 'Home section updated successfully', 'data' => $portfolio->home->fresh()], 200);
    }

    public function editAbout(Request $request)
    {
        $content = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'skills' => 'required|array',
            'skills.*' => 'string',
            'image'=>'nullable|image|max:2048',
            'cv'=>'nullable|mimes:pdf,doc,docx|max:2048',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $portfolio = $user->portfolioUser()->first();
        if (!$portfolio) {
            return response()->json(['message' => 'Portfolio not found'], 404);
        }
        elseif($portfolio->about){
            $imagePath = $portfolio->about->image_path;
            $cvPath = $portfolio->about->cv_path;

            if ($request->hasFile('image')) {
                if ($portfolio->about->image_path) {
                    Storage::disk('public')->delete($portfolio->about->image_path);
                }
                $file = $request->file('image');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('about_images', $filename, 'public');
            }

            if ($request->hasFile('cv')) {
                if ($portfolio->about->cv_path) {
                    Storage::disk('public')->delete($portfolio->about->cv_path);
                }
                $file = $request->file('cv');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $cvPath = $file->storeAs("cvs/{$user->id}", $filename, 'public');
            }

            $portfolio->about->update([
                'title' => $content['title'],
                'description' => $content['description'],
                'skills' => $content['skills'],
                'image_path' => $imagePath,
                'cv_path' => $cvPath,
            ]);

            return response()->json(['message' => 'About section updated successfully'], 200);
        }
        else{
            $imagePath = null;
            $cvPath = null;

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('about_images', $filename, 'public');
            }

            if ($request->hasFile('cv')) {
                $file = $request->file('cv');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $cvPath = $file->storeAs('cvs', $filename, 'public');
            }

            $portfolio->about->create([
                'title' => $content['title'],
                'description' => $content['description'],
                'skills' => $content['skills'],
                'image_path' => $imagePath,
                'cv_path' => $cvPath,
            ]);

            return response()->json(['message' => 'About section created successfully'], 200);
        }

        return response()->json(['message' => 'About section updated successfully'], 200);
    }

    public function editProjectsOrder(Request $request)
    {
        $portfolio_data = $request->validate([
            'projects' => 'required|array',
            'projects.*.id' => 'required|integer|exists:projects,id',
            'projects.*.sort_order' => 'nullable|integer',
            'projects.*.is_featured' => 'nullable|boolean',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $portfolio = $user->portfolioUser()->first();
        if (!$portfolio) {
            return response()->json(['message' => 'Portfolio not found'], 404);
        }

        $portfolio_id = [];

        foreach ($portfolio_data['projects'] as $project) {
            // Cari proyek berdasarkan ID di koleksi projects
            $existingProject = $portfolio->projects()->where('id', $project['id'])->first();

            if ($existingProject) {
                $existingProject->update([
                    'sort_order' => $project['sort_order'] ?? 999,
                    'is_featured' => $project['is_featured'] ?? false,
                ]);
                $portfolio_id[] = $project['id'];
            }
        }

        return response()->json(['updated_projects' => $portfolio_id], 200);
    }

    public function editContacts(Request $request)
    {
        $content = $request->validate([
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'linkedin' => 'nullable|url',
            'github' => 'nullable|url',
            'twitter' => 'nullable|url',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $portfolio = $user->portfolioUser()->first();
        if (!$portfolio) {
            return response()->json(['message' => 'Portfolio not found'], 404);
        }

        $portfolio->contacts()->update([
            'email' => $content['email'],
            'phone' => $content['phone'],
            'address' => $content['address'],
            'linkedin' => $content['linkedin'],
            'github' => $content['github'],
            'twitter' => $content['twitter'],
        ]);

        return response()->json(['message' => 'Contacts section updated successfully'], 200);
    }

    public function addPortfolio(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if portfolio already exists
        if ($user->portfolioUser()->exists()) {
            return response()->json(['message' => 'Portfolio already exists'], 400);
        }

        // Create new portfolio with default sections
        $portfolio = $user->portfolioUser()->create();

        $portfolio->home()->create([
            'greeting' => 'Hello, I am',
            'name' => 'Your Name',
            'passion' => 'Your Passion',
            'description' => 'A brief description about yourself.',
            'logo_path' => null,
        ]);

        $portfolio->about()->create([
            'title' => 'About Me',
            'description' => 'A detailed description about yourself.',
            'skills' => json_encode([]),
            'image_path' => null,
            'cv_path' => null,
        ]);

        $portfolio->contacts()->create([
            'email' => '',
            'phone' => '',
            'address' => '',
            'linkedin' => '',
            'github' => '',
            'twitter' => '',
        ]);

        return response()->json(['message' => 'Portfolio created successfully'], 201);
    }
}