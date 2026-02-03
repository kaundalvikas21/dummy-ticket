"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/contexts/locale-context";
import { BlogHero } from "@/components/pages/blog/blog-hero";
import { BlogList } from "@/components/pages/blog/blog-list";
import { BlogSidebar } from "@/components/pages/blog/blog-sidebar";
import { useTranslation } from "@/lib/translations";

export default function BlogPage() {
    const { locale } = useLocale();
    const { t } = useTranslation('blog');
    const [blogs, setBlogs] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogData();
    }, [locale]);

    const fetchBlogData = async () => {
        try {
            setLoading(true);

            // Fetch all published blogs for the current locale
            const { data: allBlogs, error: blogsError } = await supabase
                .from('blog_translations')
                .select(`
                  *,
                  blogs!inner(*)
                `)
                .eq('locale', locale)
                .eq('blogs.is_published', true)
                .order('created_at', { foreignTable: 'blogs', ascending: false });

            if (blogsError) throw blogsError;

            // Filter out any where blogs join failed (e.g. status not matching)
            const validBlogs = allBlogs?.filter(b => b.blogs) || [];
            setBlogs(validBlogs);

            // Recent posts for sidebar (top 3)
            setRecentPosts(validBlogs.slice(0, 3));

        } catch (error) {
            console.error("Error fetching blog data:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50/50">
            <BlogHero />

            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
                    {/* Blog Listing */}
                    <div className="flex-1">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t('list.latestPublication')}</h2>
                                <div className="w-12 h-1 bg-[#00C2C0] rounded-full mt-2" />
                            </div>
                            <p className="text-slate-500 text-sm hidden md:block">
                                {t('list.showing')} {blogs.length} {t('list.stories')}
                            </p>
                        </div>

                        <BlogList blogs={blogs} loading={loading} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 xl:w-96 shrink-0">
                        <BlogSidebar recentPosts={recentPosts} />
                    </div>
                </div>
            </div>
        </main>
    );
}
