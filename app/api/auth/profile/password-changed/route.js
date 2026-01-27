import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getPasswordChangedEmail } from '@/lib/email-templates';

export async function POST(request) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = session.user;

        // Get user profile details for the email template
        // We can use the metadata from the session if available, or fetch profile
        let firstName = user.user_metadata?.first_name || 'there';

        // Attempt to fetch profile for more accurate name if needed, but metadata is usually sufficient
        // for this notification purpose and faster.

        // Prepare email content
        const emailHtml = getPasswordChangedEmail({
            first_name: firstName,
        });

        // Send email
        const emailResult = await sendEmail({
            to: user.email,
            subject: 'Security Alert: Password Changed',
            html: emailHtml,
        });

        if (!emailResult.success) {
            console.error('Failed to send password change email:', emailResult.error);
            // We still return success to the client because the password change itself was successful
            // and we don't want to alarm the user or break the flow if just the email failed.
            // But logging it is important.
            return NextResponse.json(
                { warning: 'Password changed but email notification failed' },
                { status: 200 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in password-changed route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
