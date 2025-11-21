import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

// Create Supabase admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Keep client version for public operations
import { supabase } from "@/lib/supabase"

// Authentication middleware - check if user is admin via cookies
async function checkAdminAuth(request) {
  try {
    // Get auth data from cookies
    const cookieHeader = request.headers.get('cookie')

    if (!cookieHeader) {
      console.log('No cookies found')
      return null
    }

    // Parse cookies
    const cookies = {}
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        try {
          cookies[name] = decodeURIComponent(value)
        } catch (e) {
          cookies[name] = value
        }
      }
    })

    // Check for auth_profile cookie
    const authProfileCookie = cookies['auth_profile']
    if (!authProfileCookie) {
      console.log('No auth_profile cookie found')
      return null
    }

    let profile
    try {
      profile = JSON.parse(authProfileCookie)
    } catch (error) {
      console.error('Failed to parse auth_profile cookie:', error)
      return null
    }

    // Check if user has admin role
    if (profile.role !== 'admin') {
      console.log('User is not admin:', profile.role)
      return null
    }

    return profile
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function GET(request) {
  try {
    // GET can be public since it's just reading footer data
    // No auth check needed for GET operations

    // Add cache-busting headers
    const response = new NextResponse()

    // Fetch footer data from new structure
    const { data, error } = await supabaseAdmin
      .from('footer_content')
      .select('*')
      .eq('status', 'active')

  
    if (error) {
      console.error('Footer fetch error:', error)
      return NextResponse.json(
        { error: `Failed to fetch footer data: ${error.message}` },
        { status: 500 }
      )
    }

    // Organize data by sections
    const organizedData = {
      logo: null,
      description: null,
      address: null,
      company_links: [],
      support_links: [],
      contact_items: [],
      social_links: []
    }

    // Process each section from the new structure
    data.forEach(item => {
      const { section, content } = item

      // Process each section from the new structure

      switch (section) {
        case 'primary_info':
          // Extract primary info (logo, description, address)
          organizedData.logo = {
            id: item.id,
            url: content.logo_url || null,
            alt_text: content.logo_alt_text || 'VisaFly Logo',
            company_name: content.company_name || 'VisaFly'
          }
          organizedData.description = content.description || ''
          organizedData.address = content.address || ''
          organizedData.descriptionId = item.id
          organizedData.addressId = item.id
          break

        case 'links':
          // Extract company and support links
          organizedData.company_links = content.company_links || []
          organizedData.support_links = content.support_links || []
                break

        case 'contact':
          // Extract contact items and format for frontend compatibility
          organizedData.contact_items = (content || []).map(contact => ({
            id: contact.id,
            text: contact.title,
            href: contact.link_type === 'tel' ? `tel:${contact.content}` :
                 contact.link_type === 'mailto' ? `mailto:${contact.content}` :
                 contact.content,
            icon: contact.icon_type || contact.icon || 'Phone',
            country: contact.country || '',
            link_type: contact.link_type || 'tel',
            visible: contact.visible !== undefined ? contact.visible : true
          }))
                    break

        case 'social':
          // Extract social links and map url to href for frontend compatibility
          organizedData.social_links = (content || []).map(social => ({
            ...social,
            href: social.url || ''
          }))
                    break
      }
    })

    // Return the organized data

    return NextResponse.json(organizedData, {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
})
  } catch (error) {
    console.error('Footer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    // Check admin authentication for POST operations
    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { operation, section, data } = body

    
    if (operation === 'add_to_array') {
      // Server-side validation for new items
      if (section === 'links') {
        if (!data.title || !data.title.trim()) {
          return NextResponse.json(
            { error: 'Link title is required' },
            { status: 400 }
          )
        }
        if (!data.href || !data.href.trim()) {
          return NextResponse.json(
            { error: 'Link URL is required' },
            { status: 400 }
          )
        }
      } else if (section === 'contact') {
        if (!data.title || !data.title.trim()) {
          return NextResponse.json(
            { error: 'Contact title is required' },
            { status: 400 }
          )
        }
        if (!data.content || !data.content.trim()) {
          return NextResponse.json(
            { error: 'Contact information is required' },
            { status: 400 }
          )
        }
      } else if (section === 'social') {
        if (!data.name || !data.name.trim()) {
          return NextResponse.json(
            { error: 'Social media name is required' },
            { status: 400 }
          )
        }
        if (!data.url || !data.url.trim()) {
          return NextResponse.json(
            { error: 'Social media URL is required' },
            { status: 400 }
          )
        }
        if (!data.icon_name) {
          return NextResponse.json(
            { error: 'Social media icon is required' },
            { status: 400 }
          )
        }
      }

      const { data: existingRecord, error: fetchError } = await supabaseAdmin
        .from('footer_content')
        .select('content')
        .eq('section', section)
        .eq('status', 'active')
        .single()

      if (fetchError || !existingRecord) {
        return NextResponse.json(
          { error: `Section ${section} not found: ${fetchError?.message || 'No record'}` },
          { status: 404 }
        )
      }


      // Add new item with generated ID
      const newItem = {
        id: crypto.randomUUID(),
        ...data
      }

      
      let updatedContent
      if (section === 'links') {
        const linkType = data.linkType || 'company' // Default to company links
        const existingLinks = existingRecord.content[`${linkType}_links`] || []
        updatedContent = {
          ...existingRecord.content,
          [`${linkType}_links`]: [...existingLinks, newItem]
        }
              } else if (section === 'contact') {
        updatedContent = [...(existingRecord.content || []), newItem]
      } else if (section === 'social') {
        updatedContent = [...(existingRecord.content || []), newItem]
      }

      const { data: updatedRecord, error } = await supabaseAdmin
        .from('footer_content')
        .update({ content: updatedContent })
        .eq('section', section)
        .select()
        .single()

      if (error) {
        console.error('Footer array add error:', error)
        return NextResponse.json(
          { error: `Failed to add item to ${section}` },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, item: newItem })
    } else if (operation === 'update_primary') {
      // Update primary info section
      const { data: existingRecord } = await supabaseAdmin
        .from('footer_content')
        .select('content')
        .eq('section', 'primary_info')
        .eq('status', 'active')
        .single()

      if (!existingRecord) {
        // Create primary info record if it doesn't exist
        const { data: newRecord, error } = await supabaseAdmin
          .from('footer_content')
          .insert({
            section: 'primary_info',
            content: data,
            status: 'active'
          })
          .select()
          .single()

        if (error) {
          console.error('Footer primary info create error:', error)
          return NextResponse.json(
            { error: `Failed to create primary info: ${error.message}` },
            { status: 500 }
          )
        }

        return NextResponse.json(newRecord)
      } else {
        // Update existing primary info record
        const updatedContent = { ...existingRecord.content, ...data }

        const { data: updatedRecord, error } = await supabaseAdmin
          .from('footer_content')
          .update({ content: updatedContent })
          .eq('section', 'primary_info')
          .select()
          .single()

        if (error) {
          console.error('Footer primary info update error:', error)
          return NextResponse.json(
            { error: `Failed to update primary info: ${error.message}` },
            { status: 500 }
          )
        }

        return NextResponse.json(updatedRecord)
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid operation' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Footer POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    // Check admin authentication for PUT operations
    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { operation, section, itemId, data } = body

    
    if (operation === 'update_array_item') {
      // Update existing item in array
      const { data: existingRecord } = await supabaseAdmin
        .from('footer_content')
        .select('content')
        .eq('section', section)
        .eq('status', 'active')
        .single()

      if (!existingRecord) {
        return NextResponse.json(
          { error: `Section ${section} not found` },
          { status: 404 }
        )
      }

      let updatedContent
      if (section === 'links') {
        const linkType = data.linkType || 'company'
        const links = existingRecord.content[`${linkType}_links`] || []

        const updatedLinks = links.map(item => {
          if (item.id === itemId) {
            return { ...item, ...data.updateData }
          }
          return item
        })

        updatedContent = {
          ...existingRecord.content,
          [`${linkType}_links`]: updatedLinks
        }
      } else if (section === 'contact') {
        updatedContent = existingRecord.content.map(item => {
          if (item.id === itemId) {
            return { ...item, ...data.updateData }
          }
          return item
        })
      } else if (section === 'social') {
        updatedContent = existingRecord.content.map(item => {
          if (item.id === itemId) {
            return { ...item, ...data.updateData }
          }
          return item
        })
      }

      const { data: updatedRecord, error } = await supabaseAdmin
        .from('footer_content')
        .update({ content: updatedContent })
        .eq('section', section)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: `Failed to update item in ${section}` },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid operation' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Footer PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    // Check admin authentication for DELETE operations
    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const itemId = searchParams.get('itemId')

    
    if (!section || !itemId) {
      return NextResponse.json(
        { error: 'Section and itemId are required' },
        { status: 400 }
      )
    }

    // Get current record
    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from('footer_content')
      .select('content')
      .eq('section', section)
      .eq('status', 'active')
      .single()

    if (fetchError || !existingRecord) {
      return NextResponse.json(
        { error: `Section ${section} not found` },
        { status: 404 }
      )
    }

    // Remove item from array
    let updatedContent
    if (section === 'links') {
      // For links section, we need to check both company_links and support_links
      const companyLinks = (existingRecord.content.company_links || []).filter(item => item.id !== itemId)
      const supportLinks = (existingRecord.content.support_links || []).filter(item => item.id !== itemId)
      updatedContent = {
        ...existingRecord.content,
        company_links: companyLinks,
        support_links: supportLinks
      }
    } else if (section === 'contact') {
      updatedContent = existingRecord.content.filter(item => item.id !== itemId)
    } else if (section === 'social') {
      updatedContent = existingRecord.content.filter(item => item.id !== itemId)
    }

    // Update the record
    const { error: updateError } = await supabaseAdmin
      .from('footer_content')
      .update({ content: updatedContent })
      .eq('section', section)

    if (updateError) {
      console.error('Footer array deletion error:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete item from array' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Footer DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    // Check admin authentication for PATCH operations
    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const { items } = body

    // Validate required items array
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Update multiple items (for bulk reorder or status changes)
    const updatePromises = items.map(item => {
      const { id, sort_order, status } = item
      const updateData = {}

      if (sort_order !== undefined) updateData.sort_order = sort_order
      if (status !== undefined) updateData.status = status

      return supabaseAdmin
        .from('footer')
        .update(updateData)
        .eq('id', id)
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Footer PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}