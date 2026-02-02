"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { MultiCountrySelector } from "@/components/ui/multi-country-selector"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react"
import countryData from "@/data/country.json"

const LOCALES = [
    { code: 'en', label: 'English (EN)' },
    { code: 'fr', label: 'French (FR)' },
    { code: 'nl', label: 'Dutch (NL)' },
    { code: 'es', label: 'Spanish (ES)' },
    { code: 'ar', label: 'Arabic (AR)' },
]

export default function BlogEditorPage() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const fileInputRef = useRef(null)

    // Blog Meta State
    const [blogData, setBlogData] = useState({
        is_published: false,
        is_featured: false,
        target_countries: [], // Empty means global
        featured_image: "",
    })

    // Translations State
    // Structure: { en: { title: "", slug: "", description: "", content: {} }, fr: ... }
    const [translations, setTranslations] = useState(
        LOCALES.reduce((acc, loc) => ({
            ...acc,
            [loc.code]: { title: "", slug: "", description: "", content: {} }
        }), {})
    )

    const [activeTab, setActiveTab] = useState('en')

    useEffect(() => {
        if (id === 'new') {
            setLoading(false)
            return
        }
        fetchBlog()
    }, [id])

    const fetchBlog = async () => {
        try {
            const { data: blog, error } = await supabase
                .from('blogs')
                .select(`
          *,
          blog_translations (*)
        `)
                .eq('id', id)
                .single()

            if (error) throw error

            setBlogData({
                is_published: blog.is_published,
                is_featured: blog.is_featured,
                target_countries: blog.target_countries || [],
                featured_image: blog.featured_image || "",
            })

            const loadedTranslations = { ...translations }
            blog.blog_translations.forEach(t => {
                if (LOCALES.some(l => l.code === t.locale)) {
                    loadedTranslations[t.locale] = {
                        title: t.title,
                        slug: t.slug,
                        description: t.description,
                        content: t.content
                    }
                }
            })
            setTranslations(loadedTranslations)

        } catch (error) {
            console.error("Error fetching blog:", error)
            toast({
                title: "Error",
                description: "Failed to load blog data",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleTranslationChange = (field, value) => {
        setTranslations(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }))
    }

    // Auto-generate slug from title for current tab
    const handleTitleChange = (value) => {
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

        setTranslations(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                title: value,
                slug: slug
            }
        }))
    }

    const handleImageUpload = (e) => {
        let file = e.target.files[0]
        if (!file) return

        // Create local preview
        const objectUrl = URL.createObjectURL(file)

        setPendingFile(file)
        setBlogData(prev => ({ ...prev, featured_image: objectUrl }))
    }

    const handleSave = async () => {
        // Validation
        const enTitle = translations['en'].title
        if (!enTitle) {
            toast({
                title: "Validation Error",
                description: "English title is required",
                variant: "destructive"
            })
            return
        }

        setSaving(true)
        try {
            let finalImageUrl = blogData.featured_image

            // 0. Handle Image Deletion (If replaced or removed)
            if (id !== 'new') {
                const { data: currentBlog } = await supabase
                    .from('blogs')
                    .select('featured_image')
                    .eq('id', id)
                    .single()

                const oldImage = currentBlog?.featured_image

                // Logic: 
                // 1. If we have a pending file, we are definitely NOT using the old image -> delete old
                // 2. If we don't have a pending file, but finalImageUrl is different from oldImage -> delete old
                // (This covers explicit removal where finalImageUrl becomes "")

                const isReplacing = !!pendingFile
                const isRemoving = !pendingFile && oldImage && finalImageUrl !== oldImage

                if ((isReplacing || isRemoving) && oldImage) {
                    try {
                        const path = oldImage.split('/assets/').pop()
                        if (path) {
                            await supabase.storage.from('assets').remove([path])
                        }
                    } catch (e) {
                        console.error("Error deleting old image:", e)
                    }
                }
            }

            // 1. Upload Pending Image if exists
            if (pendingFile) {
                const file = pendingFile
                const fileExt = file.name.split('.').pop()
                const fileNameBase = file.name.lastIndexOf('.') !== -1
                    ? file.name.slice(0, file.name.lastIndexOf('.'))
                    : file.name

                // Sanitize
                const sanitizedBase = fileNameBase.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

                // Check for duplicates
                const { data: existingFiles } = await supabase.storage
                    .from('assets')
                    .list('blog_image/featured_image', {
                        limit: 100,
                        search: sanitizedBase
                    })

                let finalFileName = `${sanitizedBase}.${fileExt}`
                let counter = 1

                while (existingFiles && existingFiles.find(f => f.name === finalFileName)) {
                    finalFileName = `${sanitizedBase}-${counter}.${fileExt}`
                    counter++
                }

                const filePath = `blog_image/featured_image/${finalFileName}`

                const { error: uploadError } = await supabase.storage
                    .from('assets')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('assets')
                    .getPublicUrl(filePath)

                finalImageUrl = publicUrl
            }

            // 2. Upsert Blog
            const blogPayload = {
                is_published: blogData.is_published,
                is_featured: blogData.is_featured,
                target_countries: blogData.target_countries,
                featured_image: finalImageUrl,
                author_id: user?.id
            }

            let blogId = id

            if (id === 'new') {
                const { data, error } = await supabase
                    .from('blogs')
                    .insert([blogPayload])
                    .select()
                    .single()

                if (error) throw error
                blogId = data.id
            } else {
                const { error } = await supabase
                    .from('blogs')
                    .update(blogPayload)
                    .eq('id', id)

                if (error) throw error
            }

            // 2. Upsert Translations
            const translationsToUpsert = []

            for (const loc of LOCALES) {
                const t = translations[loc.code]
                if (t.title) { // Only save if title exists
                    translationsToUpsert.push({
                        blog_id: blogId,
                        locale: loc.code,
                        title: t.title,
                        slug: t.slug, // Should check uniqueness? Unique constraint on slug in DB will catch this
                        description: t.description,
                        content: t.content
                    })
                }
            }

            if (translationsToUpsert.length > 0) {
                const { error: transError } = await supabase
                    .from('blog_translations')
                    .upsert(translationsToUpsert, { onConflict: 'blog_id, locale' })

                if (transError) throw transError
            }

            toast({ title: "Success", description: "Blog saved successfully", variant: "success" })

            if (id === 'new') {
                router.push(`/admin/blogs/${blogId}`)
            }

        } catch (error) {
            console.error("Save error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to save blog",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const removeImage = () => {
        setPendingFile(null)
        setBlogData(prev => ({ ...prev, featured_image: "" }))
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {id === 'new' ? 'Create Blog' : 'Edit Blog'}
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-5 mb-4">
                                    {LOCALES.map(loc => (
                                        <TabsTrigger key={loc.code} value={loc.code}>{loc.code.toUpperCase()}</TabsTrigger>
                                    ))}
                                </TabsList>

                                {LOCALES.map(loc => (
                                    <TabsContent key={loc.code} value={loc.code} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Post Title ({loc.code.toUpperCase()})</Label>
                                            <Input
                                                value={translations[loc.code].title}
                                                onChange={(e) => loc.code === 'en' ? handleTitleChange(e.target.value) : handleTranslationChange('title', e.target.value)}
                                                placeholder="Enter blog title"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Slug</Label>
                                            <Input
                                                value={translations[loc.code].slug}
                                                onChange={(e) => handleTranslationChange('slug', e.target.value)}
                                                placeholder="url-friendly-slug"
                                            />
                                            <p className="text-xs text-muted-foreground">URL: /blog/{translations[loc.code].slug || '...'}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Short Description</Label>
                                            <Textarea
                                                value={translations[loc.code].description}
                                                onChange={(e) => handleTranslationChange('description', e.target.value)}
                                                placeholder="Brief summary for list view and SEO"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Content</Label>
                                            <div className="min-h-[400px]">
                                                <TiptapEditor
                                                    content={translations[loc.code].content?.json || translations[loc.code].content}
                                                    onChange={(content) => handleTranslationChange('content', content)}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="published">Published</Label>
                                <Switch
                                    id="published"
                                    checked={blogData.is_published}
                                    onCheckedChange={(c) => setBlogData(p => ({ ...p, is_published: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="featured">Featured</Label>
                                <Switch
                                    id="featured"
                                    checked={blogData.is_featured}
                                    onCheckedChange={(c) => setBlogData(p => ({ ...p, is_featured: c }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Country</Label>
                                <MultiCountrySelector
                                    countries={countryData}
                                    selected={blogData.target_countries}
                                    onChange={(vals) => setBlogData(p => ({ ...p, target_countries: vals }))}
                                    placeholder="Select countries (Optional)"
                                />
                                <p className="text-xs text-muted-foreground">Leave empty to show in all countries.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {blogData.featured_image ? (
                                <div className="relative aspect-video rounded-md overflow-hidden border">
                                    <img
                                        src={blogData.featured_image}
                                        alt="Featured"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={removeImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8" />
                                    <span className="text-sm">Click to upload image</span>
                                </div>
                            )}
                            <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
