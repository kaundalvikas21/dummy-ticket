/**
 * Utility functions for authentication and profile management
 */

import { supabaseAdmin } from './supabase';

/**
 * Syncs user profile data from auth metadata or provided data
 * Centralizes logic used in callback routes and registration APIs
 * 
 * @param {Object} user - The Supabase user object
 * @param {Object} customData - Optional custom data to override metadata
 * @returns {Promise<{success: boolean, profile: Object, error: any}>}
 */
export async function syncUserProfile(user, customData = {}) {
    try {
        const userMetadata = user.user_metadata || {};
        const userRole = user?.app_metadata?.role || 'user';

        // Check if profile exists
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching profile during sync:', fetchError);
            return { success: false, error: fetchError };
        }

        // Determine if we should update or insert
        const isDefaultProfile = !profile || profile.first_name === 'Unknown' || !profile.first_name;

        // Extract names with fallbacks
        const fullName = userMetadata.full_name || '';
        const firstName = customData.firstName || userMetadata.given_name || (fullName.split(' ')[0] || 'User');
        const lastName = customData.lastName || userMetadata.family_name || (fullName.split(' ').slice(1).join(' ') || '');
        const avatarUrl = userMetadata.avatar_url || userMetadata.picture;

        const profileData = {
            auth_user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl || profile?.avatar_url,
            role: userRole,
            phone_number: customData.phoneNumber || profile?.phone_number,
            country_code: customData.countryCode || profile?.country_code,
            nationality: customData.nationality || profile?.nationality,
            updated_at: new Date().toISOString(),
        };

        let result;
        if (!profile) {
            // Create new profile
            profileData.created_at = new Date().toISOString();
            result = await supabaseAdmin.from('user_profiles').insert(profileData).select().single();
        } else if (isDefaultProfile || customData.forceUpdate) {
            // Update existing default or forced update
            result = await supabaseAdmin.from('user_profiles')
                .update(profileData)
                .eq('auth_user_id', user.id)
                .select()
                .single();
        } else {
            // Profile exists and is not default, just return it
            return { success: true, profile };
        }

        if (result.error) {
            console.error('Error syncing profileData:', result.error);
            return { success: false, error: result.error };
        }

        return { success: true, profile: result.data };
    } catch (error) {
        console.error('Exception during profile sync:', error);
        return { success: false, error };
    }
}

/**
 * Normalizes name data to prevent duplication issues (e.g. "Name Name")
 * @param {string} firstName 
 * @param {string} lastName 
 * @returns {Object} { firstName, lastName }
 */
export function normalizeNames(firstName, lastName) {
    const fName = (firstName || '').trim();
    const lName = (lastName || '').trim();

    // If last name is a duplicate of first name or 'Unknown', treat as empty
    if (lName === fName || lName === 'Unknown') {
        return { firstName: fName, lastName: '' };
    }

    return { firstName: fName, lastName: lName };
}
