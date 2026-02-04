"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/translations";

export function BlogHero() {
    const { t } = useTranslation('blog');

    return (
        <section
            className="w-full flex items-center justify-center text-center pt-32 pb-16 md:pt-40 md:pb-24"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 102, 255, 0.7), rgba(0, 82, 204, 0.7)), url(/blog_hero.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="container mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
