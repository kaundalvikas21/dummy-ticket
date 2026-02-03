"use client";

import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/translations";

export function BlogSidebar({ recentPosts }) {
    const { t } = useTranslation('blog');

    return (
        <aside className="space-y-10">
            {/* Recent Posts Widget */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-[#00C2C0] rounded-full"></span>
                    {t('sidebar.recentPosts')}
                </h3>

                <div className="space-y-6">
                    {recentPosts?.length > 0 ? (
                        recentPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group flex gap-4"
                            >
                                <Link href={`/blog/${post.slug}`} className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-slate-100">
                                    <img
                                        src={post.blogs?.featured_image || "/api/placeholder/150/150"}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </Link>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-sm font-bold text-slate-900 transition-colors line-clamp-2 leading-snug">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h4>
                                    <span className="text-xs text-slate-400 mt-1">
                                        {post.blogs?.created_at ? format(new Date(post.blogs.created_at), 'MMM d, yyyy') : 'Recent'}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm">{t('sidebar.noPosts')}</p>
                    )}
                </div>
            </div>

            {/* Info Card Widget */}
            <div className="bg-[#00C2C0] rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">{t('sidebar.ctaTitle')}</h3>
                    <p className="text-blue-100 mb-6 leading-relaxed">
                        {t('sidebar.ctaSubtitle')}
                    </p>
                    <Link
                        href="/buy-ticket"
                        className="inline-flex items-center justify-center w-full py-4 px-6 bg-white text-[#00C2C0] font-bold rounded-2xl hover:bg-blue-50 transition-colors"
                    >
                        {t('sidebar.ctaButton')}
                    </Link>
                </div>
            </div>
        </aside>
    );
}
