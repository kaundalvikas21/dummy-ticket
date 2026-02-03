import { useTranslation } from "@/lib/translations";
import { Loader2 } from "lucide-react";
import { BlogCard } from "./blog-card";

export function BlogList({ blogs, loading }) {
    const { t } = useTranslation('blog');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">{t('list.loading')}</p>
            </div>
        );
    }

    if (!blogs || blogs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('list.noPostsFound')}</h3>
                <p className="text-slate-500">{t('list.noPostsDesc')}</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
            ))}
        </div>
    );
}
