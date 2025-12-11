import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Try to verify availability of service key
        // We can't check process.env here easily but if supabaseAdmin is not functioning, it will throw
        // Attempt to list users to find the email
        // Note: This is an expensive operation for large user bases but necessary 
        // without a dedicated RPC function or exposed auth schema.

        // We can try to limit the impact by pagination, but we need to find it.
        // Actually, listUsers might not support filtering by email directly in older versions.
        // In newer versions, it might. But safely, we list.

        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Reasonable limit for now
        })

        if (error) {
            console.error('List users error:', error)
            return NextResponse.json(
                { error: 'Failed to validate email check' },
                { status: 500 }
            )
        }

        const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase())

        return NextResponse.json({
            exists: userExists
        })

    } catch (error) {
        console.error('Check email server error:', error)
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        )
    }
}
