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
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Search, FileText, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { RefreshButton } from "@/components/ui/refresh-button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
import { Pagination } from "@/components/ui/pagination"

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
    const [currentPage, setCurrentPage] = useState(1)
    const blogsPerPage = 10

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

    // Pagination logic
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage)
    const currentBlogs = filteredBlogs.slice(
        (currentPage - 1) * blogsPerPage,
        currentPage * blogsPerPage
    )

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.is_published).length,
        draft: blogs.filter(b => !b.is_published).length
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blogs</h1>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-2.5 py-0.5 text-sm font-semibold">
                            {stats.total} Total
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">Manage and organize your blog content and publications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blogs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 border-gray-200 focus:ring-blue-500 rounded-lg"
                        />
                    </div>
                    <RefreshButton
                        onRefreshStart={() => setLoading(true)}
                        onRefreshEnd={() => fetchBlogs()}
                    />
                    <Button onClick={() => router.push('/admin/blogs/new')} className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-95">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Blog
                    </Button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 border-gray-200 focus:ring-blue-500 rounded-lg"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-blue-50 hover:bg-white overflow-hidden group hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-lg font-bold text-black">Total Blogs</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg transition-colors">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">All created blog posts</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-green-50 hover:bg-white overflow-hidden group hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-lg font-bold text-black">Published</CardTitle>
                        <div className="p-2 bg-green-100 rounded-lg transition-colors">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.published}</div>
                        <p className="text-xs text-muted-foreground mt-1">Live on your website</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-yellow-50 hover:bg-white overflow-hidden group hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-lg font-bold text-black">Drafts</CardTitle>
                        <div className="p-2 bg-amber-100 rounded-lg transition-colors">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.draft}</div>
                        <p className="text-xs text-muted-foreground mt-1">Work in progress</p>
                    </CardContent>
                </Card>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="py-4 font-semibold text-gray-700 w-[50px]">S.No</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Title</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Short Description</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Target Countries</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Status</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Featured</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Created At</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">Updated At</TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700 w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-32 text-center">
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                            <span className="text-muted-foreground font-medium">Loading your blogs...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredBlogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 text-gray-300" />
                                            <p>No blogs found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentBlogs.map((blog, index) => (
                                    <TableRow key={blog.id} className="hover:bg-gray-50 transition-colors group">
                                        <TableCell className="font-medium text-gray-500 py-4">
                                            {String((currentPage - 1) * blogsPerPage + index + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 py-4">
                                            {blog.blog_translations[0]?.title || 'Untitled'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm max-w-[350px] py-4">
                                            <div className="truncate leading-relaxed">
                                                {blog.blog_translations[0]?.description || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {blog.target_countries && blog.target_countries.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {blog.target_countries.slice(0, 2).map(code => (
                                                        <Badge key={code} variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 border-gray-200 bg-gray-50">
                                                            {code}
                                                        </Badge>
                                                    ))}
                                                    {blog.target_countries.length > 2 && (
                                                        <Badge variant="outline" className="text-[10px] font-bold py-0 px-1.5 border-gray-200 bg-gray-50">
                                                            +{blog.target_countries.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Global</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant={blog.is_published ? "success" : "secondary"}
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                                                    blog.is_published
                                                        ? "bg-green-50 text-green-700 border-green-100"
                                                        : "bg-gray-100 text-gray-600 border-gray-200"
                                                )}
                                            >
                                                {blog.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {blog.is_featured ? (
                                                <Badge className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 rounded-full text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                                                    Featured
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-4 text-sm font-medium">
                                            {format(new Date(blog.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-4 text-sm font-medium">
                                            {format(new Date(blog.updated_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-gray-100">
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                                                        className="rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 text-gray-400" />
                                                        <span>Edit Post</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(blog.id)}
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg transition-colors cursor-pointer dropdown-item-danger"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                                        <span>Delete Post</span>
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

                {totalPages > 1 && (
                    <div className="border-t border-gray-100 bg-gray-50/30 px-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
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
