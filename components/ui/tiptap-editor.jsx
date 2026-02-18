"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Heading from '@tiptap/extension-heading'
import { createClient } from '@/lib/supabase/client'
import { useRef, useState, useEffect } from 'react'
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
    Redo,
    Image as ImageIcon,
    Type,
    AlignCenter,
    AlignLeft,
    AlignRight,
    AlignJustify,
    Highlighter,
    Table as TableIcon,
    Plus,
    Trash2,
    EyeOff
} from "lucide-react"

export function TiptapEditor({ content, onChange, editable = true }) {
    const supabase = createClient()
    const fileInputRef = useRef(null)
    const [isUploading, setIsUploading] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            Heading.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        dataTocIgnore: {
                            default: null,
                            parseHTML: element => element.getAttribute('data-toc-ignore'),
                            renderHTML: attributes => {
                                if (!attributes.dataTocIgnore) {
                                    return {}
                                }
                                return {
                                    'data-toc-ignore': attributes.dataTocIgnore,
                                }
                            },
                        },
                    }
                }
            }).configure({
                levels: [1, 2],
            }),
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({ multicolor: true }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        editable: editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const json = editor.getJSON()
            const html = editor.getHTML()
            // Store HTML for comparison in useEffect
            lastContentRef.current = html
            onChange({ json, html })
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate focus:outline-none min-h-[300px] px-6 py-4 border-none bg-transparent max-w-none [&_table]:border-collapse [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-50 [&_th]:font-bold [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_h1[data-toc-ignore]]:opacity-50 [&_h2[data-toc-ignore]]:opacity-50 [&_h3[data-toc-ignore]]:opacity-50'
            }
        }
    })

    // Sync content when it changes externally
    const lastContentRef = useRef(content)

    useEffect(() => {
        if (editor && content !== undefined) {
            // Robust check for both HTML string and JSON object
            const isJson = typeof content === 'object' && content !== null
            const contentString = isJson ? JSON.stringify(content) : content
            const lastContentString = typeof lastContentRef.current === 'object' && lastContentRef.current !== null
                ? JSON.stringify(lastContentRef.current)
                : lastContentRef.current

            if (contentString !== lastContentString) {
                // If it's JSON, compare it properly
                const currentContent = isJson ? JSON.stringify(editor.getJSON()) : editor.getHTML()

                if (contentString !== currentContent) {
                    editor.commands.setContent(content, false)
                    lastContentRef.current = content
                }
            }
        }
    }, [editor, content])

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Create a temporary URL for preview
        const blobUrl = URL.createObjectURL(file)

        // Add image to editor
        editor.chain().focus().setImage({ src: blobUrl }).run()

        // Inform parent about the new file associated with this blob URL
        if (onChange) {
            onChange({
                json: editor.getJSON(),
                html: editor.getHTML(),
                newImage: {
                    url: blobUrl,
                    file: file
                }
            })
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

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
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const isIgnored = editor.getAttributes('heading').dataTocIgnore
                            editor.chain().focus().updateAttributes('heading', { dataTocIgnore: isIgnored ? null : 'true' }).run()
                        }}
                        disabled={!editor.isActive('heading')}
                        className={editor.getAttributes('heading').dataTocIgnore ? 'bg-muted text-red-500' : ''}
                        title="Toggle TOC Visibility"
                    >
                        <EyeOff className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        className={editor.isActive('paragraph') ? 'bg-muted' : ''}
                        title="Paragraph"
                    >
                        <Type className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        title="Upload Image"
                    >
                        {isUploading ? <ImageIcon className="w-4 h-4 animate-pulse" /> : <ImageIcon className="w-4 h-4" />}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
                        title="Justify"
                    >
                        <AlignJustify className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={editor.isActive('highlight') ? 'bg-muted' : ''}
                        title="Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert Table"
                    >
                        <TableIcon className="w-4 h-4" />
                    </Button>
                    {editor.isActive('table') && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                title="Add Row"
                            >
                                <Plus className="w-4 h-4 rotate-90" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                title="Add Column"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                className="text-red-500"
                                title="Delete Table"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
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
