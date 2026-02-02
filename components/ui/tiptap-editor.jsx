"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo
} from "lucide-react"

export function TiptapEditor({ content, onChange, editable = true }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content: content,
        editable: editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange({ json: editor.getJSON(), html: editor.getHTML() })
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate focus:outline-none min-h-[300px] px-6 py-4 border-none bg-transparent max-w-none'
            }
        }
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border border-input rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/50">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-muted' : ''}
                    >
                        <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-muted' : ''}
                    >
                        <Italic className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                    >
                        <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                    >
                        <Heading2 className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mr-2">Paragraph</p>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
                    >
                        <Quote className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="w-4 h-4" />
                    </Button>

                </div>
            )}
            <EditorContent editor={editor} className="p-0 min-h-[300px]" />
        </div>
    )
}
