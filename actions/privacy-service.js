'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPrivacySections() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('privacy_policy_sections')
        .select(`
            *,
            translations:privacy_policy_section_translations(*)
        `)
        .order('order_index', { ascending: true })

    if (error) {
        console.error('Error fetching privacy sections:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function upsertPrivacySection(sectionData) {
    const supabase = await createClient()
    const { id, is_active, order_index, translations } = sectionData

    try {
        // 1. Upsert Section
        const sectionPayload = {
            is_active,
            order_index
        }

        if (id) sectionPayload.id = id

        const { data: section, error: sectionError } = await supabase
            .from('privacy_policy_sections')
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
                    .from('privacy_policy_section_translations')
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
                    .from('privacy_policy_section_translations')
                    .upsert(translationsPayload, {
                        onConflict: 'section_id, locale'
                    })

                if (transError) throw transError
            }
        }

        revalidatePath('/privacy-policy')
        revalidatePath('/admin/pages/privacy')

        return { success: true, data: section }
    } catch (error) {
        console.error('Error upserting privacy section:', error)
        return { success: false, error: error.message }
    }
}

export async function deletePrivacySection(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('privacy_policy_sections')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting privacy section:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/privacy-policy')
    revalidatePath('/admin/pages/privacy')

    return { success: true }
}

export async function updatePrivacySectionOrder(items) {
    const supabase = await createClient()

    const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from('privacy_policy_sections')
        .upsert(updates)

    if (error) {
        console.error('Error updating order:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/privacy-policy')
    revalidatePath('/admin/pages/privacy')

    return { success: true }
}
