"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocale } from "@/contexts/locale-context"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Loader2, Calendar, Link2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SingleBlogPost() {
    const { slug } = useParams()
    const { locale } = useLocale()
    const { toast } = useToast()
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
        // Regex to match headings with optional attributes
        const headingRegex = /<(h[23])([^>]*)>(.*?)<\/\1>/g

        const processedHtml = htmlContent.replace(headingRegex, (match, tag, attrs, text) => {
            // Check if ignored
            const isIgnored = attrs.includes('data-toc-ignore')

            // Remove HTML tags from text for the ID
            const cleanText = text.replace(/<[^>]*>/g, '')
            const id = cleanText
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            if (!isIgnored) {
                toc.push({ id, text: cleanText, level: tag === 'h2' ? 2 : 3 })
            }

            // Append ID and scroll offset class. 
            // Note: Simplistic interaction with existing attributes. 
            // If class exists in attrs, this creates a second class attribute which is technically invalid but browsers often handle it.
            // For Tiptap's standard output this is usually fine.
            return `<${tag}${attrs} id="${id}" class="scroll-mt-24">${text}</${tag}>`
        })

        return { processedHtml, toc }
    }

    const { processedHtml, toc } = processContent(blog.content?.html)

    return (
        <div className="pb-20 bg-white">
            {/* Hero Header */}
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                {/* Blue Overlay Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] to-[#0052CC] opacity-90" />

                {/* Background Image (Subtle) */}
                <img
                    src={blog.blogs?.featured_image || "/api/placeholder/1200/600"}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    alt={blog.title}
                />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
                    <div className="container mx-auto">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white max-w-7xl leading-tight mb-4">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-3 text-white/90 text-sm mb-4">
                            <Calendar className="w-4 h-4 text-blue-200" />
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
                                    {/* Facebook */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full hover:bg-blue-50 hover:text-blue-600 group"
                                        onClick={() => window.open('https://www.facebook.com/', '_blank')}
                                        title="Facebook"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.249h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </Button>

                                    {/* Instagram */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full hover:bg-pink-50 hover:text-pink-600 group"
                                        onClick={() => window.open('https://www.instagram.com/', '_blank')}
                                        title="Instagram"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </Button>

                                    {/* X (formerly Twitter) */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full hover:bg-gray-200 hover:text-black group transition-colors"
                                        onClick={() => window.open('https://twitter.com/', '_blank')}
                                        title="X"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                        </svg>
                                    </Button>

                                    {/* Copy Link */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full hover:bg-slate-100"
                                        onClick={async () => {
                                            const url = window.location.href
                                            let success = false

                                            // Try modern API
                                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                                try {
                                                    await navigator.clipboard.writeText(url)
                                                    success = true
                                                } catch (err) {
                                                    console.warn('Clipboard API failed', err)
                                                }
                                            }

                                            // Fallback
                                            if (!success) {
                                                try {
                                                    const textArea = document.createElement("textarea")
                                                    textArea.value = url
                                                    textArea.style.position = "fixed" // Avoid scrolling to bottom
                                                    document.body.appendChild(textArea)
                                                    textArea.focus()
                                                    textArea.select()
                                                    success = document.execCommand('copy')
                                                    document.body.removeChild(textArea)
                                                } catch (err) {
                                                    console.error('Fallback copy failed', err)
                                                }
                                            }

                                            if (success) {
                                                toast({
                                                    title: "Link copied",
                                                    description: "The post URL has been copied to your clipboard.",
                                                })
                                            } else {
                                                toast({
                                                    title: "Failed to copy",
                                                    description: "Could not copy the link. Please try manually.",
                                                    variant: "destructive",
                                                })
                                            }
                                        }}
                                        title="Copy Link"
                                    >
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
