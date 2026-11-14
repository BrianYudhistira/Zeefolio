import { useState, useEffect, useRef } from "react";
import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import {
    HiChevronLeft,
    HiChevronRight,
    HiArrowsPointingOut,
} from "react-icons/hi2";

function ImageSlider({ images, altText, onImageClick }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.3 }
        );

        if (sliderRef.current) {
            observer.observe(sliderRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!images || images.length <= 1 || !isInView || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [images, currentIndex, isInView, isHovered]);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div
                className="relative group/single cursor-pointer overflow-hidden rounded-2xl"
                onClick={() => onImageClick && onImageClick(images[0])}
            >
                <img
                    src={images[0]}
                    alt={altText}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover/single:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/single:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                        <HiArrowsPointingOut className="w-4 h-4" />
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={sliderRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden group/slider bg-neutral-950 border border-white/10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((imgSrc, idx) => (
                    <div
                        key={idx}
                        className="w-full h-full shrink-0 relative cursor-pointer"
                        onClick={() => onImageClick && onImageClick(imgSrc)}
                    >
                        <img
                            src={imgSrc}
                            alt={`${altText} ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="p-2.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                                <HiArrowsPointingOut className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slider Controls */}
            <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all z-20 border border-white/10 shadow-lg backdrop-blur-md"
                aria-label="Previous image"
            >
                <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all z-20 border border-white/10 shadow-lg backdrop-blur-md"
                aria-label="Next image"
            >
                <HiChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots & Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${idx === currentIndex
                                ? "w-5 bg-white"
                                : "w-1.5 bg-white/30 hover:bg-white/60"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function ProjectShowcaseGallery({
    screenshots = [],
    onImageClick,
}) {
    if (!screenshots || screenshots.length === 0) return null;

    return (
        <section className="mb-20">
            <div className="my-16">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <AnimatedContent
                distance={30}
                direction="vertical"
                reverse={true}
                duration={1}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0.1}
            >
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        Visual Walkthrough & Screenshots
                    </h2>
                    <p className="text-neutral-400 text-sm max-w-xl mt-2 font-mono">
                        Interactive screen previews and functional views of this application.
                    </p>
                </div>
            </AnimatedContent>

            <div className="space-y-16 lg:space-y-24">
                {screenshots.map((screenshot, idx) => (
                    <AnimatedContent
                        key={idx}
                        distance={40}
                        direction="vertical"
                        reverse={false}
                        duration={1}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={0.98}
                        threshold={0.05}
                        delay={0.05}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                            {/* Left Slider / Image */}
                            <div
                                className={`lg:col-span-8 ${idx % 2 === 1 ? "lg:order-2" : "lg:order-1"
                                    }`}
                            >
                                <ImageSlider
                                    images={screenshot.src}
                                    altText={screenshot.alt}
                                    onImageClick={onImageClick}
                                />
                            </div>

                            {/* Right Information */}
                            <div
                                className={`lg:col-span-4 space-y-4 ${idx % 2 === 1 ? "lg:order-1" : "lg:order-2"
                                    }`}
                            >
                                <span className="text-xs font-mono tracking-[0.2em] uppercase text-neutral-500 block">
                                    {String(idx + 1).padStart(2, "0")} /{" "}
                                    {String(screenshots.length).padStart(2, "0")}
                                </span>
                                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                    {screenshot.alt}
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                                    {screenshot.caption}
                                </p>
                            </div>
                        </div>
                    </AnimatedContent>
                ))}
            </div>
        </section>
    );
}
