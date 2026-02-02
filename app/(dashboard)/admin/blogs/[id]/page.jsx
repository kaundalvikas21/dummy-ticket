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
import { LOCALES } from "@/lib/locales"
import { FlagIcon } from "@/components/ui/flag-icon"
import countryData from "@/data/country.json"

const LOCALES_ARRAY = Object.values(LOCALES)

const getWordCount = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const extractImageUrls = (json) => {
    const urls = []
    if (!json) return urls

    const traverse = (node) => {
        if (node.type === 'image' && node.attrs?.src) {
            urls.push(node.attrs.src)
        }
        if (node.content) {
            node.content.forEach(traverse)
        }
    }
    traverse(json)
    return urls
}

const replaceBlobUrls = (json, urlMap) => {
    if (!json) return json
    const newJson = JSON.parse(JSON.stringify(json))

    const traverse = (node) => {
        if (node.type === 'image' && node.attrs?.src) {
            if (urlMap[node.attrs.src]) {
                node.attrs.src = urlMap[node.attrs.src]
            }
        }
        if (node.content) {
            node.content.forEach(traverse)
        }
    }
    traverse(newJson)
    return newJson
}

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
    const initialDataRef = useRef(null)

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
        LOCALES_ARRAY.reduce((acc, loc) => ({
            ...acc,
            [loc.code]: { title: "", slug: "", description: "", content: {} }
        }), {})
    )

    const [pendingImages, setPendingImages] = useState(new Map()) // blobUrl -> File
    const initialContentUrlsRef = useRef({}) // locale -> [url1, url2, ...]

    const [activeTab, setActiveTab] = useState('en')

    // Change Detection
    const hasChanges = initialDataRef.current ? (
        JSON.stringify(initialDataRef.current.blogData) !== JSON.stringify(blogData) ||
        JSON.stringify(initialDataRef.current.translations) !== JSON.stringify(translations) ||
        !!pendingFile
    ) : false

    useEffect(() => {
        if (id === 'new') {
            const initialTranslations = LOCALES_ARRAY.reduce((acc, loc) => ({
                ...acc,
                [loc.code]: { title: "", slug: "", description: "", content: {} }
            }), {})
            const initialBlog = {
                is_published: false,
                is_featured: false,
                target_countries: [],
                featured_image: "",
            }
            initialDataRef.current = {
                blogData: initialBlog,
                translations: initialTranslations
            }
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
                if (LOCALES_ARRAY.some(l => l.code === t.locale)) {
                    loadedTranslations[t.locale] = {
                        title: t.title,
                        slug: t.slug,
                        description: t.description,
                        content: t.content
                    }
                }
            })
            setTranslations(loadedTranslations)

            initialDataRef.current = {
                blogData: {
                    is_published: blog.is_published,
                    is_featured: blog.is_featured,
                    target_countries: blog.target_countries || [],
                    featured_image: blog.featured_image || "",
                },
                translations: loadedTranslations
            }

            // Track initial content URLs for cleanup
            const initialUrls = {}
            LOCALES_ARRAY.forEach(loc => {
                initialUrls[loc.code] = extractImageUrls(loadedTranslations[loc.code].content?.json || loadedTranslations[loc.code].content)
            })
            initialContentUrlsRef.current = initialUrls

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
        if (field === 'content' && value.newImage) {
            setPendingImages(prev => {
                const next = new Map(prev)
                next.set(value.newImage.url, value.newImage.file)
                return next
            })
        }

        setTranslations(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value.json ? value : value // Tiptap returns {json, html}
            }
        }))
    }

    // Auto-generate slug from title for specific locale
    const handleTitleChange = (value, locCode = activeTab) => {
        const slug = value
            .toLowerCase()
            .normalize('NFD') // Normalize to decomposed form to handle accented characters
            .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

        setTranslations(prev => ({
            ...prev,
            [locCode]: {
                ...prev[locCode],
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
        const en = translations['en']
        if (!en.title || !en.description || !en.content || (typeof en.content === 'object' && Object.keys(en.content).length === 0)) {
            toast({
                title: "Validation Error",
                description: "English content (Title, Short Description, and Content) is mandatory.",
                variant: "destructive"
            })
            setActiveTab('en')
            return
        }

        // Validate word limit for short descriptions
        for (const loc of LOCALES_ARRAY) {
            const desc = translations[loc.code].description
            if (desc && getWordCount(desc) > 50) {
                toast({
                    title: "Validation Error",
                    description: `Short description (${loc.code.toUpperCase()}) exceeds 50 word limit.`,
                    variant: "destructive"
                })
                setActiveTab(loc.code)
                return
            }
        }

        setSaving(true)
        try {
            let finalImageUrl = blogData.featured_image

            // 1. Handle Featured Image Original Logic (kept same but updated with pendingFile)
            if (id !== 'new') {
                const { data: currentBlog } = await supabase.from('blogs').select('featured_image').eq('id', id).single()
                const oldImage = currentBlog?.featured_image
                const isReplacing = !!pendingFile
                const isRemoving = !pendingFile && oldImage && finalImageUrl !== oldImage
                if ((isReplacing || isRemoving) && oldImage) {
                    try {
                        const path = oldImage.split('/assets/').pop()
                        if (path) await supabase.storage.from('assets').remove([path])
                    } catch (e) {
                        console.error("Error deleting old featured image:", e)
                    }
                }
            }

            if (pendingFile) {
                const file = pendingFile
                const fileExt = file.name.split('.').pop()
                const fileNameBase = file.name.lastIndexOf('.') !== -1 ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name
                const sanitizedBase = fileNameBase.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

                const { data: existingFiles } = await supabase.storage.from('assets').list('blog_image/featured_image', { limit: 100, search: sanitizedBase })
                let finalFileName = `${sanitizedBase}.${fileExt}`
                let counter = 1
                while (existingFiles && existingFiles.find(f => f.name === finalFileName)) {
                    finalFileName = `${sanitizedBase}-${counter}.${fileExt}`
                    counter++
                }
                const filePath = `blog_image/featured_image/${finalFileName}`
                const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath)
                finalImageUrl = publicUrl
            }

            // --- 2. DEFERRED TIPTAP IMAGE UPLOADS ---
            const finalTranslations = JSON.parse(JSON.stringify(translations))
            const blobToPublicMap = {}

            for (const loc of LOCALES_ARRAY) {
                const content = finalTranslations[loc.code].content
                if (!content || !content.json) continue

                const usedUrls = extractImageUrls(content.json)
                const usedBlobUrls = usedUrls.filter(url => url.startsWith('blob:'))

                for (const blobUrl of usedBlobUrls) {
                    if (blobToPublicMap[blobUrl]) continue

                    const file = pendingImages.get(blobUrl)
                    if (file) {
                        const fileExt = file.name.split('.').pop()
                        const fileNameBase = file.name.lastIndexOf('.') !== -1 ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name
                        const sanitizedBase = fileNameBase.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

                        const { data: existingFiles } = await supabase.storage.from('assets').list('blog_image/content_image', { limit: 100, search: sanitizedBase })
                        let finalFileName = `${sanitizedBase}.${fileExt}`
                        let counter = 1
                        while (existingFiles && existingFiles.find(f => f.name === finalFileName)) {
                            finalFileName = `${sanitizedBase}-${counter}.${fileExt}`
                            counter++
                        }

                        const filePath = `blog_image/content_image/${finalFileName}`
                        const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file)
                        if (uploadError) throw uploadError

                        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath)
                        blobToPublicMap[blobUrl] = publicUrl
                    }
                }

                // Replace blob URLs in JSON and HTML
                if (Object.keys(blobToPublicMap).length > 0) {
                    finalTranslations[loc.code].content.json = replaceBlobUrls(content.json, blobToPublicMap)
                    // Simple replacement for HTML string
                    let html = content.html
                    Object.entries(blobToPublicMap).forEach(([blob, pub]) => {
                        html = html.split(blob).join(pub)
                    })
                    finalTranslations[loc.code].content.html = html
                }
            }

            // --- 3. UPSERT BLOG & TRANSLATIONS ---
            const blogPayload = {
                is_published: blogData.is_published,
                is_featured: blogData.is_featured,
                target_countries: blogData.target_countries,
                featured_image: finalImageUrl,
                author_id: user?.id
            }

            let blogId = id
            if (id === 'new') {
                const { data, error } = await supabase.from('blogs').insert([blogPayload]).select().single()
                if (error) throw error
                blogId = data.id
            } else {
                const { error } = await supabase.from('blogs').update(blogPayload).eq('id', id)
                if (error) throw error
            }

            const translationsToUpsert = []
            for (const loc of LOCALES_ARRAY) {
                const t = finalTranslations[loc.code]
                if (t.title) {
                    translationsToUpsert.push({
                        blog_id: blogId,
                        locale: loc.code,
                        title: t.title,
                        slug: t.slug,
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

            // --- 4. STORAGE CLEANUP (Deleted Images) ---
            const newAllUrls = []
            LOCALES_ARRAY.forEach(loc => {
                newAllUrls.push(...extractImageUrls(finalTranslations[loc.code].content?.json || finalTranslations[loc.code].content))
            })

            const oldAllUrls = []
            Object.values(initialContentUrlsRef.current).forEach(urls => oldAllUrls.push(...urls))

            const urlsToDelete = oldAllUrls.filter(url => !newAllUrls.includes(url) && url.includes('/assets/blog_image/'))

            if (urlsToDelete.length > 0) {
                const pathsToDelete = urlsToDelete.map(url => url.split('/assets/').pop()).filter(Boolean)
                if (pathsToDelete.length > 0) {
                    await supabase.storage.from('assets').remove(pathsToDelete)
                }
            }

            // --- 5. FINALIZE ---
            initialDataRef.current = {
                blogData: { ...blogPayload, featured_image: finalImageUrl },
                translations: JSON.parse(JSON.stringify(finalTranslations))
            }

            // Update initialContentUrlsRef for next save
            const nextInitialUrls = {}
            LOCALES_ARRAY.forEach(loc => {
                nextInitialUrls[loc.code] = extractImageUrls(finalTranslations[loc.code].content?.json || finalTranslations[loc.code].content)
            })
            initialContentUrlsRef.current = nextInitialUrls

            setTranslations(finalTranslations)
            setPendingFile(null)
            setPendingImages(new Map())

            // Delay revocation slightly to allow browser to switch to public URLs
            if (blobToPublicMap) {
                setTimeout(() => {
                    Object.keys(blobToPublicMap).forEach(url => URL.revokeObjectURL(url))
                }, 1000)
            }

            toast({ title: "Success", description: "Blog saved successfully", variant: "success" })
            if (id === 'new') router.push(`/admin/blogs/${blogId}`)

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
        <div className="p-6 space-y-6 max-w-[1450px] mx-auto">
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
                <Button onClick={handleSave} disabled={saving || !hasChanges} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {hasChanges ? 'Save Changes' : 'No Changes'}
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
                                    {LOCALES_ARRAY.map(loc => (
                                        <TabsTrigger key={loc.code} value={loc.code} className="flex items-center gap-2">
                                            <FlagIcon
                                                src={loc.flag}
                                                alt={loc.name}
                                                countryCode={loc.countryCode}
                                                size={16}
                                            />
                                            {loc.code.toUpperCase()}
                                            {loc.code === 'en' && <span className="ml-1 text-red-500">*</span>}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {LOCALES_ARRAY.map(loc => (
                                    <TabsContent key={loc.code} value={loc.code} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1">
                                                Post Title ({loc.code.toUpperCase()})
                                                {loc.code === 'en' && <span className="text-red-500">*</span>}
                                            </Label>
                                            <Input
                                                value={translations[loc.code].title}
                                                onChange={(e) => handleTitleChange(e.target.value, loc.code)}
                                                placeholder={loc.code === 'en' ? "Enter blog title (Required)" : "Enter blog title"}
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
                                            <div className="flex justify-between items-center">
                                                <Label className="flex items-center gap-1">
                                                    Short Description
                                                    {loc.code === 'en' && <span className="text-red-500">*</span>}
                                                </Label>
                                                <span className={`text-xs ${getWordCount(translations[loc.code].description) > 50 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                                    {getWordCount(translations[loc.code].description)}/50 words
                                                </span>
                                            </div>
                                            <Textarea
                                                value={translations[loc.code].description}
                                                onChange={(e) => handleTranslationChange('description', e.target.value)}
                                                placeholder={loc.code === 'en' ? "Brief summary (Required, Max 50 words)" : "Brief summary (Max 50 words)"}
                                                rows={3}
                                                className={getWordCount(translations[loc.code].description) > 50 ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-1">
                                                Content
                                                {loc.code === 'en' && <span className="text-red-500">*</span>}
                                            </Label>
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
