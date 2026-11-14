import { Head, Link } from '@inertiajs/react';
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import FuturisticBackground from "@/Components/Animations/Background/FuturisticBackground";

export default function ErrorPage({ status }) {
    const errorDetails = {
        403: {
            title: '403',
            name: 'Access Denied',
            description: 'You do not have permission to access this resource.',
            image: '/images/asset/404.svg'
        },
        404: {
            title: '404',
            name: 'Page Not Found',
            description: 'Sorry, the page you are looking for could not be found.',
            image: '/images/asset/404.svg'
        },
        419: {
            title: '419',
            name: 'Page Expired',
            description: 'Your session has expired. Please refresh and try again.',
            image: '/images/asset/500.svg'
        },
        500: {
            title: '500',
            name: 'Server Error',
            description: 'Whoops, something went wrong on our servers. We are looking into it.',
            image: '/images/asset/500.svg'
        }
    };

    const details = errorDetails[status] || errorDetails[404];

    return (
        <>
            <Head title={`${details.title} - ${details.name}`} />

            <FuturisticBackground
                speed={0.5}
                particleCount={40}
                interactive={true}
                resolutionScale={0.75}
            />

            <div className="relative min-h-screen flex items-center justify-center font-retro-mono px-6 py-12 md:py-16 lg:px-16 bg-[#050510]/95 transition-colors duration-300">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="text-center md:text-left flex flex-col items-center md:items-start order-2 md:order-1 relative z-10">
                        <AnimatedContent distance={40} direction="vertical" reverse={false} duration={1} ease="power3.out" initialOpacity={0} animateOpacity scale={1} threshold={0.1}>
                            <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold leading-none tracking-tight mb-2 font-retro-pixel bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                                {details.title}
                            </h1>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mb-6 font-retro-pixel leading-tight bg-gradient-to-r from-cyan-200 to-blue-300 bg-clip-text text-transparent">
                                {details.name}
                            </h2>
                        </AnimatedContent>

                        <AnimatedContent distance={30} direction="vertical" reverse={true} duration={1} ease="power3.out" initialOpacity={0} animateOpacity scale={1} threshold={0.1} delay={0.2}>
                            <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed mb-8 md:mb-10 max-w-md mx-auto md:mx-0">
                                {details.description}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto text-sm font-bold text-[#050510] bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full hover:from-cyan-300 hover:to-sky-300 transition-all duration-300 tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:scale-[1.02]">
                                    GO HOME
                                </Link>
                            </div>
                        </AnimatedContent>
                    </div>

                    <div className="order-1 md:order-2 w-full flex justify-center md:justify-end relative z-10">
                        <div className="w-full max-w-[320px] lg:max-w-md xl:max-w-lg">
                            <AnimatedContent distance={40} direction="vertical" reverse={true} duration={1.2} ease="power3.out" initialOpacity={0} animateOpacity scale={0.95} threshold={0.1} delay={0.1}>
                                <div className="relative w-full group">
                                    <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />

                                    <img
                                        src={details.image}
                                        alt={`${details.name} Illustration`}
                                        className="relative z-10 w-full h-auto object-contain transition-transform duration-700 group-hover:-translate-y-5 drop-shadow-[0_0_25px_rgba(34,211,238,0.15)]"
                                    />
                                </div>
                            </AnimatedContent>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
