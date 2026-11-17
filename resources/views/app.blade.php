<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @if(!empty($seo))
            <title inertia>{{ $seo['title'] ?? config('app.name', 'Laravel') }}</title>
            @if(!empty($seo['description']))
                <meta inertia="description" name="description" content="{{ $seo['description'] }}">
            @endif
            @if(!empty($seo['robots']))
                <meta inertia="robots" name="robots" content="{{ $seo['robots'] }}">
            @endif
            @if(!empty($seo['canonical']))
                <link inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
            @endif

            @if(!empty($seo['og']))
                <meta inertia="og:type" property="og:type" content="{{ $seo['og']['type'] ?? 'website' }}">
                <meta inertia="og:site_name" property="og:site_name" content="{{ $seo['og']['site_name'] ?? config('app.name', 'ZeeFolio') }}">
                <meta inertia="og:title" property="og:title" content="{{ $seo['og']['title'] ?? '' }}">
                <meta inertia="og:description" property="og:description" content="{{ $seo['og']['description'] ?? '' }}">
                <meta inertia="og:url" property="og:url" content="{{ $seo['og']['url'] ?? '' }}">
                <meta inertia="og:image" property="og:image" content="{{ $seo['og']['image'] ?? '' }}">
            @endif

            @if(!empty($seo['twitter']))
                <meta inertia="twitter:card" name="twitter:card" content="{{ $seo['twitter']['card'] ?? 'summary_large_image' }}">
                <meta inertia="twitter:title" name="twitter:title" content="{{ $seo['twitter']['title'] ?? '' }}">
                <meta inertia="twitter:description" name="twitter:description" content="{{ $seo['twitter']['description'] ?? '' }}">
                <meta inertia="twitter:image" name="twitter:image" content="{{ $seo['twitter']['image'] ?? '' }}">
            @endif

            @if(!empty($seo['json_ld']))
                <script inertia="json-ld" type="application/ld+json">{!! json_encode($seo['json_ld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
            @endif
        @else
            @php($defaultSeo = \App\Services\SeoService::defaultPlatformSeo())
            <title inertia>{{ config('app.name', 'ZeeFolio') }}</title>
            @if(request()->is('admin*'))
                <meta inertia="robots" name="robots" content="noindex, nofollow">
            @endif
            <meta inertia="description" name="description" content="{{ $defaultSeo['description'] }}">
            <meta inertia="og:type" property="og:type" content="website">
            <meta inertia="og:site_name" property="og:site_name" content="{{ config('app.name', 'ZeeFolio') }}">
            <meta inertia="og:title" property="og:title" content="{{ $defaultSeo['title'] }}">
            <meta inertia="og:description" property="og:description" content="{{ $defaultSeo['description'] }}">
            <meta inertia="og:url" property="og:url" content="{{ $defaultSeo['url'] }}">
            <meta inertia="og:image" property="og:image" content="{{ $defaultSeo['image'] }}">
            <meta inertia="twitter:card" name="twitter:card" content="summary_large_image">
            <meta inertia="twitter:title" property="twitter:title" content="{{ $defaultSeo['title'] }}">
            <meta inertia="twitter:description" property="twitter:description" content="{{ $defaultSeo['description'] }}">
            <meta inertia="twitter:image" property="twitter:image" content="{{ $defaultSeo['image'] }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

        <!-- Devicon - Technology Icons (Pinned Version: SEC-15) -->
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css" crossorigin="anonymous" />

        <!-- Scripts -->
        @routes(request()->is('admin*') ? null : 'public')
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased scroll-smooth">
        @inertia
    </body>
</html>
