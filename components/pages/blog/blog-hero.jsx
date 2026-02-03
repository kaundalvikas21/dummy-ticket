"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/translations";

export function BlogHero() {
    const { t } = useTranslation('blog');

    return (
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />
            <img
                src="/blog_hero.jpg"
                alt="Blogs Background"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
            />

            {/* Content */}
            <div className="container mx-auto px-4 pt-24 pb-16 md:py-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center text-white"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight">
                        {t('hero.title')}
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto">
                        {t('hero.subtitle')}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
