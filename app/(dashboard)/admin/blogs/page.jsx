"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
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

export default function BlogsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            // Fetch blogs with their default english translation for the title
            const { data, error } = await supabase
                .from('blogs')
                .select(`
          *,
          blog_translations!inner (
            title
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

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this blog?")) return

        try {
            // 1. Fetch blog to get image URL
            const { data: blog, error: fetchError } = await supabase
                .from('blogs')
                .select('featured_image')
                .eq('id', id)
                .single()

            if (fetchError) {
                console.error("Error fetching blog for deletion:", fetchError)
                throw fetchError
            }

            // 2. Delete image from storage if exists
            if (blog.featured_image) {
                try {
                    // Extract path from public URL
                    // URL format: .../storage/v1/object/public/assets/path/to/file
                    const path = blog.featured_image.split('/assets/').pop()
                    if (path) {
                        const { error: storageError } = await supabase.storage
                            .from('assets')
                            .remove([path])

                        if (storageError) {
                            console.error("Error deleting image from storage:", storageError)
                            // We verify continue to delete the blog even if image deletion fails, 
                            // to avoid "stuck" blogs. But we log the error.
                        }
                    }
                } catch (e) {
                    console.error("Error processing image deletion:", e)
                }
            }

            // 3. Delete blog record
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', id)

            if (error) throw error

            setBlogs(blogs.filter(blog => blog.id !== id))
            toast({
                title: "Success",
                description: "Blog deleted successfully",
                variant: "success",
            })
        } catch (error) {
            console.error("Error deleting blog:", error)
            toast({
                title: "Error",
                description: "Failed to delete blog",
                variant: "destructive",
            })
        }
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
                <Button onClick={() => router.push('/admin/blogs/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blog
                </Button>
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
                                                    onClick={() => handleDelete(blog.id)}
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
        </div>
    )
}
