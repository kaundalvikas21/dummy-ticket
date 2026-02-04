"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/contexts/locale-context";
import { BlogHero } from "@/components/pages/blog/blog-hero";
import { BlogList } from "@/components/pages/blog/blog-list";
import { BlogSidebar } from "@/components/pages/blog/blog-sidebar";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTranslation } from "@/lib/translations";

export default function BlogPage() {
    const { locale } = useLocale();
    const { t } = useTranslation('blog');
    const [blogs, setBlogs] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 8;

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
            setCurrentPage(1); // Reset to first page when locale changes

        } catch (error) {
            console.error("Error fetching blog data:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <BlogHero />

            <div className="container mx-auto px-4 pt-8 md:pt-12 pb-16">
                <Breadcrumbs
                    items={[
                        { label: 'Blog' }
                    ]}
                />

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

                        <BlogList
                            blogs={blogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage)}
                            loading={loading}
                        />

                        {blogs.length > blogsPerPage && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(blogs.length / blogsPerPage)}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-24 self-start">
                        <BlogSidebar recentPosts={recentPosts} />
                    </div>
                </div>
            </div>
        </div>
    );
}
