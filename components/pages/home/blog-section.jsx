"use client"

import { useState, useEffect } from "react"
import { useLocale } from "@/contexts/locale-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"

export function BlogSection() {
    const { locale } = useLocale()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBlogs()
    }, [locale])

    const fetchBlogs = async () => {
        try {
            setLoading(true)

            // Get country from localStorage as requested
            const detectedCountry = localStorage.getItem('last-detected-country') || 'IN'

            // Fetch blogs that are published and match country criteria
            // target_countries is an array. Filter: empty array OR contains detectedCountry
            const { data, error } = await supabase
                .from('blogs')
                .select(`
          *,
          blog_translations!inner (*)
        `)
                .eq('is_published', true)
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(10) // Fetch a few more to filter in JS if needed, though we try to filter in query

            if (error) throw error

            // Post-filter for target countries and requested translations
            // We want to prefer the current locale, then fallback to 'en'
            const processedBlogs = (data || []).filter(blog => {
                // Filter by target country
                const isGlobal = !blog.target_countries || blog.target_countries.length === 0
                const isTargeted = blog.target_countries && blog.target_countries.includes(detectedCountry)
                return isGlobal || isTargeted
            }).map(blog => {
                // Get correct translation
                const translation = blog.blog_translations.find(t => t.locale === locale) ||
                    blog.blog_translations.find(t => t.locale === 'en') ||
                    blog.blog_translations[0]

                return {
                    ...blog,
                    translation
                }
            }).slice(0, 4) // We need top 4 for the layout

            setBlogs(processedBlogs)
        } catch (error) {
            console.error("Error fetching frontend blogs:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (blogs.length === 0) return null

    const mainBlog = blogs[0]
    const sideBlogs = blogs.slice(1, 4)

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Latest from our <span className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] bg-clip-text text-transparent">Blog</span>
                        </h2>
                        <p className="text-slate-600 max-w-2xl">
                            Stay updated with travel tips, visa news, and guides for your next trip.
                        </p>
                    </div>
                    <Link href="/blog" className="hidden md:block">
                        <Button className="rounded-full bg-linear-to-r from-[#0066FF] to-[#00D4AA] hover:opacity-90 transition-opacity text-white px-6 cursor-pointer">
                            View All Blogs <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Featured Blog (Left) */}
                    <div className="lg:col-span-7 group">
                        <Link href={`/blog/${mainBlog.translation?.slug}`} className="block overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={mainBlog.featured_image || "/api/placeholder/800/450"}
                                    alt={mainBlog.translation?.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                        Latest
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {format(new Date(mainBlog.created_at), 'MMMM d, yyyy')}
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 transition-colors">
                                    {mainBlog.translation?.title}
                                </h3>
                                <div className="flex items-center text-blue-600 font-bold gap-2 transition-all">
                                    Read More <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Side Stack (Right) */}
                    <div className="lg:col-span-5 space-y-6">
                        {sideBlogs.map((blog) => (
                            <Link
                                key={blog.id}
                                href={`/blog/${blog.translation?.slug}`}
                                className="flex gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden items-center"
                            >
                                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden rounded-lg">
                                    <img
                                        src={blog.featured_image || "/api/placeholder/400/400"}
                                        alt={blog.translation?.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex flex-col justify-center py-1">
                                    <span className="text-xs text-slate-500 mb-1">
                                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                                    </span>
                                    <h4 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight transition-colors mb-2">
                                        {blog.translation?.title}
                                    </h4>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                        {blog.translation?.description}
                                    </p>
                                    <div className="text-sm font-semibold text-blue-600 flex items-center gap-1 transition-all">
                                        Read More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {sideBlogs.length === 0 && (
                            <div className="h-full flex items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
                                More stories coming soon...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
