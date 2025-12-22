import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

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

        // 1. Unlink Bookings (Set user_id to NULL to preserve financial data but remove link)
        // The bookings table has a FK constraint without CASCADE, which prevents deleting the user if they have bookings.
        const { error: bookingError } = await supabaseAdmin
            .from('bookings')
            .update({ user_id: null })
            .eq('user_id', user_id)

        if (bookingError) {
            console.error("Error unlinking bookings:", bookingError)
            // We might want to abort or continue? Usually abort to prevent partial state if critical.
            // But continuing might just fail at the next step anyway.
            // Let's return error to be safe.
            return NextResponse.json(
                { error: "Failed to unlink user bookings: " + bookingError.message },
                { status: 500 }
            )
        }

        // 2. Delete from Supabase Auth (This is the critical step)
        // This will typically CASCADE delete the referencing row in public.user_profiles if properly configured
        // If NOT configured to cascade, we might need to manually delete from user_profiles too, but let's assume standard behavior first or force it.
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

        // 2. Explicitly delete from user_profiles just in case Cascade isn't set up or fails silently
        // Note: If Cascade IS set up, this might return 0 rows affected, which is fine.
        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .delete()
            .eq('auth_user_id', user_id) // using auth_user_id as the link

        if (profileError) {
            console.warn("Warning: Failed to delete profile explicitly (might have cascaded):", profileError)
            // We don't error here because the main goal (Auth deletion) succeeded
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
