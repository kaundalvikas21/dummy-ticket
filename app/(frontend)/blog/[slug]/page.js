"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocale } from "@/contexts/locale-context"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Loader2, ArrowLeft, Calendar, Share2, Facebook, Twitter, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SingleBlogPost() {
    const { slug } = useParams()
    const { locale } = useLocale()
    const router = useRouter()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBlog()
    }, [slug, locale])

    const fetchBlog = async () => {
        try {
            setLoading(true)

            // Fetch by slug from translations
            const { data, error } = await supabase
                .from('blog_translations')
                .select(`
          *,
          blogs (*)
        `)
                .eq('slug', slug)
                .single()

            if (error) {
                // Try fallback English if current locale not found (unlikely if slug is unique across locales, but good safeguard)
                throw error
            }

            setBlog(data)
        } catch (error) {
            console.error("Error fetching blog post:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
                <Button onClick={() => router.push('/')}>Return Home</Button>
            </div>
        )
    }

    const renderContent = (content) => {
        // If it's JSON from Tiptap, we'd ideally need a renderer or convert to HTML
        // For now, let's check if it's already HTML or JSON
        if (typeof content === 'string') return <div dangerouslySetInnerHTML={{ __html: content }} />

        // Simplistic JSON to text fallback if no renderer is available right now
        // In a prod app, we'd use a parser, but for this task we'll assume it's stored/retrieved as HTML or we use the Editor in readonly mode
        return <div className="prose lg:prose-xl max-w-none">{JSON.stringify(content)}</div>
    }

    // Helper to process HTML and extract TOC
    const processContent = (htmlContent) => {
        if (!htmlContent) return { processedHtml: "", toc: [] }

        const toc = []
        const headingRegex = /<(h[23])>(.*?)<\/\1>/g

        const processedHtml = htmlContent.replace(headingRegex, (match, tag, text) => {
            // Remove HTML tags from text for the ID
            const cleanText = text.replace(/<[^>]*>/g, '')
            const id = cleanText
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            toc.push({ id, text: cleanText, level: tag === 'h2' ? 2 : 3 })
            // Add scroll-mt-48 to offset the fixed header when jumping
            return `<${tag} id="${id}" class="scroll-mt-24">${text}</${tag}>`
        })

        return { processedHtml, toc }
    }

    const { processedHtml, toc } = processContent(blog.content?.html)

    return (
        <div className="pb-20 bg-white">
            {/* Hero Header */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                <img
                    src={blog.blogs?.featured_image || "/api/placeholder/1200/600"}
                    className="w-full h-full object-cover"
                    alt={blog.title}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="container mx-auto">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white max-w-4xl leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-3 text-white/90 text-sm mb-4">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span>{format(new Date(blog.blogs?.created_at), 'MMMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-6 mt-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <article className="lg:col-span-8 flex-1">
                        <div className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl prose-headings:scroll-mt-24">
                            <div className="blog-content-area">
                                {blog.description && (
                                    <p className="text-xl text-slate-600 font-medium mb-8 leading-relaxed italic border-l-4 border-blue-400 pl-6">
                                        {blog.description}
                                    </p>
                                )}
                                <div className="mt-8 text-slate-800 leading-relaxed text-lg">
                                    {processedHtml ? (
                                        <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: processedHtml }} />
                                    ) : "Post content goes here..."}
                                </div>
                            </div>
                        </div>

                        {/* Tags/Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-900">Share this post:</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600">
                                        <Facebook className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full hover:bg-sky-50 hover:text-sky-500">
                                        <Twitter className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full hover:bg-slate-50">
                                        <Link2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:w-80 shrink-0 space-y-10">
                        <div className="sticky top-24 space-y-10">
                            {/* Table of Contents */}
                            {toc.length > 0 && (
                                <div>
                                    <h5 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Table of Contents</h5>
                                    <nav>
                                        <ul className="list-disc pl-4 space-y-2">
                                            {toc.map((item) => (
                                                <li key={item.id} className={`${item.level === 3 ? 'ml-4' : ''} text-slate-400`}>
                                                    <a
                                                        href={`#${item.id}`}
                                                        className={`text-sm hover:text-blue-600 transition-colors ${item.level === 3 ? 'text-slate-500' : 'text-slate-700 font-medium'
                                                            }`}
                                                    >
                                                        {item.text}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
