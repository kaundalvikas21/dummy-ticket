"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/translations";

export function BlogCard({ blog }) {
    const { t } = useTranslation('blog');
    const { title, slug, excerpt, description, blogs, created_at } = blog;
    const featuredImage = blogs?.featured_image || "/api/placeholder/800/450";
    const date = blogs?.created_at || created_at;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            <Link href={`/blog/${slug}`} className="block relative overflow-hidden aspect-video">
                <img
                    src={featuredImage}
                    alt={title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
            </Link>

            <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{date ? format(new Date(date), 'MMMM d, yyyy') : 'Recent'}</span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 transition-colors line-clamp-2">
                    <Link href={`/blog/${slug}`}>{title}</Link>
                </h3>

                <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                    {excerpt || description}
                </p>

                <div className="mt-auto">
                    <Link
                        href={`/blog/${slug}`}
                        className="inline-flex items-center text-[#00C2C0] font-semibold hover:gap-2 transition-all gap-1"
                    >
                        {t('list.readFullArticle')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
