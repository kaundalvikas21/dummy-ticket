"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { RefreshButton } from "@/components/ui/refresh-button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function BlogsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [blogToDelete, setBlogToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('blogs')
                .select(`
          *,
          blog_translations!inner (
            title,
            description
          )
        `)
                .eq('blog_translations.locale', 'en')
                .order('created_at', { ascending: false })

            if (error) throw error
            setBlogs(data || [])
        } catch (error) {
            console.error("Error fetching blogs:", error)
            toast({
                title: "Error",
                description: "Failed to load blogs",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (id) => {
        setBlogToDelete(id)
    }

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return

        try {
            setIsDeleting(true)
            const id = blogToDelete

            // 1. Fetch blog to get image URL for storage cleanup
            const { data: blog, error: fetchError } = await supabase
                .from('blogs')
                .select('featured_image, blog_translations(content)')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            // 2. Collect all images to delete (featured + content images)
            const imagesToDelete = []
            if (blog.featured_image) imagesToDelete.push(blog.featured_image)

            if (blog.blog_translations) {
                blog.blog_translations.forEach(t => {
                    const contentJson = t.content?.json || t.content
                    if (contentJson) {
                        const urls = extractImageUrls(contentJson)
                        imagesToDelete.push(...urls)
                    }
                })
            }

            // Cleanup storage
            const uniqueImages = [...new Set(imagesToDelete)].filter(url => url.includes('/assets/blog_image/'))
            if (uniqueImages.length > 0) {
                const paths = uniqueImages.map(url => url.split('/assets/').pop()).filter(Boolean)
                if (paths.length > 0) {
                    await supabase.storage.from('assets').remove(paths)
                }
            }

            // 3. Delete translations first to be safe
            const { error: transDeleteError } = await supabase
                .from('blog_translations')
                .delete()
                .eq('blog_id', id)

            if (transDeleteError) {
                console.error("Error deleting translations:", transDeleteError)
            }

            // 4. Delete blog record
            const { error, count } = await supabase
                .from('blogs')
                .delete({ count: 'exact' })
                .eq('id', id)

            if (error) throw error

            if (count === 0 && !transDeleteError) {
                throw new Error("Deletion failed. You might not have permission to delete this blog.")
            }

            setBlogs(prev => prev.filter(b => b.id !== id))
            toast({
                title: "Success",
                description: "Blog and associated images deleted successfully",
                variant: "success",
            })
        } catch (error) {
            console.error("Error deleting blog:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to delete blog",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setBlogToDelete(null)
        }
    }

    // Helper for deletion cleanup (can be placed outside or inside)
    function extractImageUrls(json) {
        const urls = []
        if (!json) return urls
        const traverse = (node) => {
            if (node.type === 'image' && node.attrs?.src) urls.push(node.attrs.src)
            if (node.content) node.content.forEach(traverse)
        }
        traverse(json)
        return urls
    }

    const filteredBlogs = blogs.filter(blog =>
        blog.blog_translations[0]?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
                    <p className="text-muted-foreground">Manage your blog posts and content.</p>
                </div>
                <div className="flex gap-2">
                    <RefreshButton
                        onRefreshStart={() => setLoading(true)}
                        onRefreshEnd={() => fetchBlogs()}
                    />
                    <Button onClick={() => router.push('/admin/blogs/new')} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Blog
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Short Description</TableHead>
                            <TableHead>Target Countries</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        <span>Loading blogs...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredBlogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No blogs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">
                                        {blog.blog_translations[0]?.title || 'Untitled'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                                        {blog.blog_translations[0]?.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {blog.target_countries && blog.target_countries.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {blog.target_countries.slice(0, 3).map(code => (
                                                    <Badge key={code} variant="outline" className="text-xs">
                                                        {code}
                                                    </Badge>
                                                ))}
                                                {blog.target_countries.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{blog.target_countries.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Global</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={blog.is_published ? "success" : "secondary"}>
                                            {blog.is_published ? "Published" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {blog.is_featured && (
                                            <Badge variant="default" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                                                Featured
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/admin/blogs/${blog.id}`)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(blog.id)}
                                                    className="text-red-600 focus:text-red-600 dropdown-item-danger"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!blogToDelete} onOpenChange={(open) => !open && setBlogToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog post
                            and all associated images from storage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleConfirmDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </div>
                            ) : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
