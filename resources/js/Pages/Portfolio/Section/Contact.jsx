import AnimatedContent from "@/Components/Animations/UI/AnimatedContent";
import { useForm } from "@inertiajs/react";
import { HiOutlineEnvelope, HiOutlinePhone, HiPaperAirplane, HiCheckCircle } from "react-icons/hi2";
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa6";

export default function ContactSection({ contacts, sosmedLinks }) {
    const { data, setData, post, processing, reset, recentlySuccessful, errors } = useForm({
        name: "",
        email: "",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/messageMe", {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const socialLinks = sosmedLinks || {};

    return (
        <section id="contact" className="relative w-full py-24 sm:py-32 scroll-mt-16">
            <div className="max-w-[85%] 2xl:max-w-[80%] mx-auto w-full relative z-10">
                {/* Section Header */}
                <div className="mb-16 md:mb-20 text-center">
                    <AnimatedContent
                        distance={40}
                        direction="vertical"
                        reverse={true}
                        duration={1}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        threshold={0.15}
                        delay={0}
                    >
                        <span className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-3">
                            04 // CONTACT
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                            Let's Connect
                        </h2>
                        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                            Have an opportunity, question, or engineering project in mind? Reach out anytime.
                        </p>
                    </AnimatedContent>
                </div>

                {/* 2-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                    {/* Left Column - Contact Details */}
                    <div className="w-full lg:w-5/12 space-y-8">
                        <AnimatedContent
                            distance={50}
                            direction="horizontal"
                            reverse={true}
                            duration={1.2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0.1}
                        >
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white tracking-tight">
                                    Direct Channels
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                                    Feel free to send an email, place a call, or connect across professional networks.
                                </p>

                                {/* Email Box */}
                                {contacts?.email && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all">
                                        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                                            <HiOutlineEnvelope className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                                                Email
                                            </span>
                                            <a
                                                href={`mailto:${contacts.email}`}
                                                className="text-sm font-mono text-white hover:underline truncate block"
                                            >
                                                {contacts.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Phone Box */}
                                {contacts?.phone && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all">
                                        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                                            <HiOutlinePhone className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                                                Phone
                                            </span>
                                            <a
                                                href={`tel:${contacts.phone}`}
                                                className="text-sm font-mono text-white hover:underline truncate block"
                                            >
                                                {contacts.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Presence */}
                            <div className="pt-4 space-y-3">
                                <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 block">
                                    Social Networks
                                </span>
                                <div className="flex items-center gap-3">
                                    {socialLinks.linkedin && (
                                        <a
                                            href={socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-all duration-300 backdrop-blur-md hover:scale-105"
                                            aria-label="LinkedIn"
                                        >
                                            <FaLinkedinIn className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socialLinks.github && (
                                        <a
                                            href={socialLinks.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-all duration-300 backdrop-blur-md hover:scale-105"
                                            aria-label="GitHub"
                                        >
                                            <FaGithub className="w-4 h-4" />
                                        </a>
                                    )}
                                    {socialLinks.instagram && (
                                        <a
                                            href={socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white transition-all duration-300 backdrop-blur-md hover:scale-105"
                                            aria-label="Instagram"
                                        >
                                            <FaInstagram className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </AnimatedContent>
                    </div>

                    {/* Right Column - Glassmorphic Contact Form */}
                    <div className="w-full lg:w-7/12">
                        <AnimatedContent
                            distance={50}
                            direction="horizontal"
                            reverse={false}
                            duration={1.2}
                            ease="power3.out"
                            initialOpacity={0}
                            animateOpacity
                            scale={1}
                            threshold={0.1}
                            delay={0.2}
                        >
                            <div className="rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                                    Send a Message
                                </h3>
                                <p className="text-xs sm:text-sm text-neutral-400 mb-6">
                                    I will get back to your inquiry promptly.
                                </p>

                                {recentlySuccessful && (
                                    <div className="mb-6 p-4 rounded-xl bg-white/[0.05] border border-white/20 flex items-center gap-3 text-white text-sm font-mono">
                                        <HiCheckCircle className="w-5 h-5 text-white shrink-0" />
                                        <span>Message sent successfully! Thank you for reaching out.</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono tracking-wider uppercase text-neutral-300">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            placeholder="e.g. Alex Morgan"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            className="w-full text-sm px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200"
                                        />
                                        {errors?.name && (
                                            <p className="text-xs text-neutral-400">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono tracking-wider uppercase text-neutral-300">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="e.g. alex@example.com"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            className="w-full text-sm px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200"
                                        />
                                        {errors?.email && (
                                            <p className="text-xs text-neutral-400">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-mono tracking-wider uppercase text-neutral-300">
                                            Message
                                        </label>
                                        <textarea
                                            rows={5}
                                            name="message"
                                            required
                                            placeholder="Describe your project, goals, or inquiry..."
                                            value={data.message}
                                            onChange={(e) => setData("message", e.target.value)}
                                            className="w-full text-sm px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 focus:border-white/40 focus:bg-white/[0.04] text-white placeholder-neutral-600 outline-none transition-all duration-200 resize-none"
                                        />
                                        {errors?.message && (
                                            <p className="text-xs text-neutral-400">{errors.message}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`w-full py-3.5 px-6 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] ${processing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                            }`}
                                    >
                                        <span>{processing ? "Sending..." : "Send Inquiry"}</span>
                                        <HiPaperAirplane className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </div>
        </section>
    );
}