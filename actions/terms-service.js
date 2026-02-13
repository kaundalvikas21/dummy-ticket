'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTermsSections() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('terms_service_sections')
        .select(`
            *,
            translations:terms_service_section_translations(*)
        `)
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching terms sections:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function upsertTermsSection(sectionData) {
    const supabase = await createClient()
    const { id, key, is_active, order_index, translations } = sectionData

    try {
        // 1. Upsert Section
        const sectionPayload = {
            key,
            is_active,
            order_index
        }

        if (id) sectionPayload.id = id

        const { data: section, error: sectionError } = await supabase
            .from('terms_service_sections')
            .upsert(sectionPayload)
            .select()
            .single()

        if (sectionError) throw sectionError

        const finalSectionId = section?.id || id
        if (!finalSectionId) throw new Error("Could not determine section ID")

        // 2. Sync Translations (Upsert provided, Delete removed)
        if (translations) {
            const localesToKeep = translations.map(t => t.locale)

            // Delete locales that are no longer present
            if (id) { // Only delete if updating existing section
                const { error: deleteError } = await supabase
                    .from('terms_service_section_translations')
                    .delete()
                    .eq('section_id', finalSectionId)
                    .not('locale', 'in', `(${localesToKeep.join(',')})`)

                if (deleteError) throw deleteError
            }

            if (translations.length > 0) {
                const translationsPayload = translations.map(t => ({
                    section_id: finalSectionId,
                    locale: t.locale,
                    title: t.title,
                    content: t.content
                }))

                const { error: transError } = await supabase
                    .from('terms_service_section_translations')
                    .upsert(translationsPayload, {
                        onConflict: 'section_id, locale'
                    })

                if (transError) throw transError
            }
        }

        revalidatePath('/terms')
        revalidatePath('/admin/pages/terms')

        return { success: true, data: section }
    } catch (error) {
        console.error('Error upserting terms section:', error)
        return { success: false, error: error.message }
    }
}

export async function deleteTermsSection(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('terms_service_sections')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting terms section:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/terms')
    revalidatePath('/admin/pages/terms')

    return { success: true }
}

export async function updateTermsSectionOrder(items) {
    const supabase = await createClient()

    const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from('terms_service_sections')
        .upsert(updates)

    if (error) {
        console.error('Error updating order:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/terms')
    revalidatePath('/admin/pages/terms')

    return { success: true }
}
