"use client"

import { useState, useEffect } from "react"
import { motion, Reorder } from "framer-motion"
import { Plus, GripVertical, Pencil, Trash2, Save, X, Globe, ChevronDown, Check, Search, Eye, EyeOff, Scale, Shield, Lock, FileText, RefreshCcw, Info, HelpCircle, Bell, Settings, User, CreditCard, Mail, MessageSquare, AlertTriangle, Cloud, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPrivacySections, upsertPrivacySection, deletePrivacySection, updatePrivacySectionOrder } from "@/actions/privacy-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LANGUAGES = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" }
]

export default function PrivacyPolicyAdminPage() {
    const { toast } = useToast()
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
    const [editingSection, setEditingSection] = useState(null)
    const [sectionToDelete, setSectionToDelete] = useState(null)
    const [formData, setFormData] = useState({
        is_active: true,
        translations: {} // { en: { title: '', content: '' }, fr: ... }
    })
    const [activeTab, setActiveTab] = useState("en")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredSections = sections.filter(section => {
        const enTranslation = section.translations?.find(t => t.locale === 'en')
        const searchLower = searchQuery.toLowerCase()
        return (
            enTranslation?.title?.toLowerCase().includes(searchLower) ||
            enTranslation?.content?.toLowerCase().includes(searchLower)
        )
    })

    useEffect(() => {
        fetchSections()
    }, [])

    const fetchSections = async () => {
        setLoading(true)
        const result = await getPrivacySections()
        if (result.success) {
            setSections(result.data)
        } else {
            toast({
                title: "Error",
                description: "Failed to fetch privacy sections",
                variant: "destructive"
            })
        }
        setLoading(false)
    }

    const handleReorder = async (newOrder) => {
        setSections(newOrder)
        const result = await updatePrivacySectionOrder(newOrder)
        if (!result.success) {
            toast({
                title: "Error",
                description: "Failed to update order",
                variant: "destructive"
            })
            fetchSections() // Revert on error
        }
    }

    const handleEdit = (section) => {
        setEditingSection(section)
        const translationsMap = {}
        LANGUAGES.forEach(lang => {
            const existing = section.translations.find(t => t.locale === lang.code)
            translationsMap[lang.code] = {
                id: existing?.id, // Keep ID for updates
                title: existing?.title || "",
                content: existing?.content || ""
            }
        })

        setFormData({
            is_active: section.is_active,
            translations: translationsMap
        })
        setIsModalOpen(true)
    }

    const handleAdd = () => {
        setEditingSection(null)
        const translationsMap = {}
        LANGUAGES.forEach(lang => {
            translationsMap[lang.code] = { title: "", content: "" }
        })
        setFormData({
            is_active: true,
            translations: translationsMap
        })
        setIsModalOpen(true)
    }

    const handleDeleteClick = (section) => {
        setSectionToDelete(section)
        setIsDeleteAlertOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!sectionToDelete) return

        const result = await deletePrivacySection(sectionToDelete.id)
        if (result.success) {
            toast({
                title: "Success",
                description: "Section deleted successfully",
                variant: "success"
            })
            fetchSections()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to delete section",
                variant: "destructive"
            })
        }
        setIsDeleteAlertOpen(false)
        setSectionToDelete(null)
    }

    const handleSave = async () => {
        // Validation: Ensure English title and content exist at minimum
        if (!formData.translations['en']?.title || !formData.translations['en']?.content) {
            toast({
                title: "Validation Error",
                description: "English title and content are required",
                variant: "destructive"
            })
            return
        }

        const translationsArray = Object.entries(formData.translations)
            .filter(([_, data]) => data.title.trim() !== "") // Only save translations with titles
            .map(([locale, data]) => {
                const translation = {
                    locale,
                    title: data.title,
                    content: data.content
                }
                if (data.id) {
                    translation.id = data.id
                }
                return translation
            })

        const payload = {
            id: editingSection?.id,
            is_active: formData.is_active,
            order_index: editingSection ? editingSection.order_index : sections.length,
            translations: translationsArray
        }

        const result = await upsertPrivacySection(payload)

        if (result.success) {
            toast({
                title: "Success",
                description: `Section ${editingSection ? 'updated' : 'created'} successfully`,
                variant: "success"
            })
            setIsModalOpen(false)
            fetchSections()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to save section",
                variant: "destructive"
            })
        }
    }

    const updateTranslation = (field, value) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [activeTab]: {
                    ...prev.translations[activeTab],
                    [field]: value
                }
            }
        }))
    }


    const handleVisibilityToggle = async (section) => {
        const newStatus = !section.is_active
        const payload = {
            id: section.id,
            is_active: newStatus,
            order_index: section.order_index,
            translations: section.translations.map(t => ({
                id: t.id,
                locale: t.locale,
                title: t.title,
                content: t.content
            }))
        }
        const result = await upsertPrivacySection(payload)
        if (result.success) {
            toast({
                title: "Success",
                description: `Section ${newStatus ? 'visible' : 'hidden'} successfully`,
                variant: "success"
            })
            fetchSections()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to toggle visibility",
                variant: "destructive"
            })
        }
    }

    const stripHtml = (html) => {
        if (!html) return ""
        return html.replace(/<[^>]*>?/gm, '')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-lg gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[#0066FF] to-[#00D4AA]">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500">Manage your Privacy Policy sections and translations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search sections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 transition-all rounded-lg"
                        />
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Section
                    </Button>
                </div>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle>Sections</CardTitle>
                    <CardDescription>Drag to reorder sections. Toggle visibility or edit content.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
                        </div>
                    ) : filteredSections.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p>{searchQuery ? "No sections match your search." : "No sections found. Create your first section."}</p>
                        </div>
                    ) : (
                        <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-3">
                            {filteredSections.map((section) => {
                                const enTranslation = section.translations?.find(t => t.locale === 'en')
                                return (
                                    <Reorder.Item
                                        key={section.id}
                                        value={section}
                                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-xs hover:shadow-md transition-shadow group"
                                    >
                                        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                            <GripVertical className="w-5 h-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {enTranslation?.title || "Untitled Section"}
                                                        </h3>
                                                        {!section.is_active && (
                                                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                                                                Hidden
                                                            </span>
                                                        )}

                                                        {/* Translation Completion Badge */}
                                                        <div className="flex items-center gap-2 ml-auto shrink-0">
                                                            <span className="text-[11px] text-gray-500">Translation:</span>
                                                            {(() => {
                                                                const translatedCount = LANGUAGES.filter(lang =>
                                                                    section.translations?.some(t => t.locale === lang.code && t.title?.trim() && t.content?.trim())
                                                                ).length
                                                                const percentage = Math.round((translatedCount / LANGUAGES.length) * 100)
                                                                const isComplete = percentage === 100

                                                                return (
                                                                    <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-[#0066FF]'}`}
                                                                                style={{ width: `${percentage}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className={`text-[11px] font-medium ${isComplete ? 'text-green-600' : 'text-[#0066FF]'}`}>
                                                                            {percentage}%
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                                        {stripHtml(enTranslation?.content) || "No content"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleVisibilityToggle(section)}
                                                title={section.is_active ? "Mark as Hidden" : "Mark as Visible"}
                                            >
                                                {section.is_active ? (
                                                    <Eye className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(section)}>
                                                <Pencil className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(section)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </Reorder.Item>
                                )
                            })}
                        </Reorder.Group>
                    )}
                </CardContent>
            </Card>

            {/* Edit/Create Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSection ? 'Edit Section' : 'Add Section'}</DialogTitle>
                        <DialogDescription>
                            Configure section details and translations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor="active-mode" className="flex flex-col space-y-1">
                                    <span>Active Status</span>
                                    <span className="font-normal text-xs text-gray-500">Visible on public page</span>
                                </Label>
                                <Switch
                                    id="active-mode"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(pre => ({ ...pre, is_active: checked }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold text-gray-900">Content Translations</Label>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="flex w-full overflow-x-auto justify-start h-auto p-1.5 bg-gray-100 rounded-xl mb-6 gap-1">
                                    {LANGUAGES.map(lang => (
                                        <TabsTrigger
                                            key={lang.code}
                                            value={lang.code}
                                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex item-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 flex-1"
                                        >
                                            <span className="text-base leading-none">{lang.flag}</span>
                                            <span>{lang.name}</span>
                                            {lang.code === 'en' && <span className="text-[10px] opacity-70 ml-1 font-normal bg-gray-200 px-1 rounded-sm">Req</span>}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {LANGUAGES.map(lang => (
                                    <TabsContent key={lang.code} value={lang.code} className="space-y-5 animate-in fade-in-50 duration-300">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Section Title <span className="text-gray-400 font-normal">({lang.name})</span> {lang.code === 'en' && <span className="text-red-500">*</span>}</Label>
                                            <Input
                                                placeholder={`e.g., Privacy Policy (${lang.name})`}
                                                value={formData.translations[lang.code]?.title || ""}
                                                onChange={(e) => updateTranslation('title', e.target.value)}
                                                className="h-11 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20 transition-all"
                                                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700">Content <span className="text-gray-400 font-normal">({lang.name})</span> {lang.code === 'en' && <span className="text-red-500">*</span>}</Label>
                                            <TiptapEditor
                                                content={formData.translations[lang.code]?.content || ""}
                                                onChange={({ html }) => updateTranslation('content', html)}
                                                editable={true}
                                            />
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.translations['en']?.title || !formData.translations['en']?.content}
                            className="bg-linear-to-r from-[#0066FF] to-[#00D4AA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Section?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this section and all its translations. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteAlertOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
