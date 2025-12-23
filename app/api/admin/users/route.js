import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { cleanupOldAvatar } from "@/lib/avatar-utils"

export async function DELETE(request) {
    try {
        const supabaseAdmin = createAdminClient()
        const { user_id } = await request.json()

        if (!user_id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        // 1. Unlink Bookings
        const { error: bookingError } = await supabaseAdmin
            .from('bookings')
            .update({ user_id: null })
            .eq('user_id', user_id)

        if (bookingError) {
            console.error("Error unlinking bookings:", bookingError)
            return NextResponse.json(
                { error: "Failed to unlink user bookings: " + bookingError.message },
                { status: 500 }
            )
        }

        // 1.5 Clean up Avatar Storage
        // Fetch profile to get storage path
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('avatar_storage_path')
            .eq('auth_user_id', user_id)
            .single()

        if (profile?.avatar_storage_path) {
            console.log("Cleaning up avatar for user:", user_id, "Path:", profile.avatar_storage_path)
            await cleanupOldAvatar(user_id, supabaseAdmin, profile.avatar_storage_path)
        }

        // 2. Delete from Supabase Auth
        // This will typically CASCADE delete the referencing row in public.user_profiles if properly configured
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
            user_id
        )

        if (authError) {
            console.error("Error deleting from Auth:", authError)
            return NextResponse.json(
                { error: authError.message },
                { status: 500 }
            )
        }

        // 3. Explicitly delete from user_profiles just in case
        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .delete()
            .eq('auth_user_id', user_id)

        if (profileError) {
            console.warn("Warning: Failed to delete profile explicitly (might have cascaded):", profileError)
        }

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Delete user error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
