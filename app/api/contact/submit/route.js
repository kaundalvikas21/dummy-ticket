import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, phone, subject, message, priority = 'normal' } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'urgent']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Validate data length
    if (name.length > 255 || email.length > 255 || subject.length > 255) {
      return NextResponse.json(
        { error: 'Name, email, and subject must be less than 255 characters' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      )
    }

    // Validate phone number format if provided
    if (phone && phone.length > 50) {
      return NextResponse.json(
        { error: 'Phone number must be less than 50 characters' },
        { status: 400 }
      )
    }

    // Insert contact submission
    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : null,
          subject: subject.trim(),
          message: message.trim(),
          priority,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating contact submission:', error)
      return NextResponse.json(
        { error: 'Failed to submit contact form', details: error.message },
        { status: 500 }
      )
    }

    // Log successful submission
    console.log(`Contact submission received from ${email}: ${subject}`)

    return NextResponse.json({
      message: 'Contact form submitted successfully',
      submission: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        status: submission.status,
        priority: submission.priority,
        created_at: submission.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/contact/submit:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}