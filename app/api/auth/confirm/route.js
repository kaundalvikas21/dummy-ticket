
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/'

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            // Redirect user to specified redirect URL or root of app
            const redirectTo = request.nextUrl.clone()
            redirectTo.pathname = next
            redirectTo.searchParams.delete('token_hash')
            redirectTo.searchParams.delete('type')

            return NextResponse.redirect(redirectTo)
        }
    }

    // return the user to an error page with some instructions
    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = '/error'
    return NextResponse.redirect(redirectTo)
}
