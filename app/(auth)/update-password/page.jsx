"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { useToast } from '@/hooks/use-toast'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function UpdatePasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isValidatingLink, setIsValidatingLink] = useState(true)
    const [tokenHash, setTokenHash] = useState(null)
    const [isValidResetLink, setIsValidResetLink] = useState(false)

    // Extract token_hash from URL on page load
    useEffect(() => {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        // Debug logging
        console.log('Password reset params:', {
            token_hash: token_hash ? token_hash.substring(0, 20) + '...' : 'null',
            type
        })

        if (token_hash && type === 'recovery') {
            setTokenHash(token_hash)
            setIsValidResetLink(true)
        } else {
            setIsValidResetLink(false)
            toast({
                variant: "destructive",
                title: "Invalid Reset Link",
                description: "This password reset link is invalid or has expired.",
            })
            setTimeout(() => {
                router.push('/forgot-password')
            }, 3000)
        }
        setIsValidatingLink(false)
    }, [searchParams, router, toast])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(updatePasswordSchema),
    })

    const onSubmit = async (data) => {
        if (!isValidResetLink || !tokenHash) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Invalid password reset session. Please request a new password reset.",
            })
            return
        }

        setIsLoading(true)

        try {
            // Create a temporary Supabase client instance for password reset
            const { createClient } = await import('@supabase/supabase-js')
            const tempSupabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    }
                }
            )

            // First verify the OTP token and get a session
            const { data: verifyData, error: verifyError } = await tempSupabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery'
            })

            if (verifyError) {
                console.error('OTP verification error:', verifyError)
                throw new Error('Invalid or expired reset link. Please request a new password reset.')
            }

            // Now update the password using the session from verification
            const { error: updateError } = await tempSupabase.auth.updateUser({
                password: data.password
            })

            if (updateError) {
                console.error('Update password error:', updateError)
                throw new Error('Failed to update password. Please try again.')
            }

            // Sign out any temporary session
            await tempSupabase.auth.signOut()

            toast({
                title: "Password Updated",
                description: "Your password has been successfully updated. Please login with your new password.",
                variant: "success",
            })

            // Redirect to login after successful update
            setTimeout(() => {
                router.push('/login?message=Password updated successfully')
            }, 2000)

        } catch (error) {
            console.error('Password update error:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || 'Failed to update password',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidatingLink) {
        return (
            <AuthLayout
                title="Validating..."
                description="Please wait while we validate your reset link"
            >
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AuthLayout>
        )
    }

    if (!isValidResetLink) {
        return (
            <AuthLayout
                title="Invalid Link"
                description="Redirecting you to forgot password page..."
            >
                <div className="text-center text-gray-600">
                    <p>This password reset link is invalid or has expired.</p>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Set New Password"
            description="Enter your new password below"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    id="password"
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    icon={Lock}
                    showPasswordToggle={true}
                    {...register('password')}
                    error={errors.password?.message}
                />

                <FormField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm new password"
                    icon={Lock}
                    showPasswordToggle={true}
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                />

                <div className="pt-4">
                    <AuthButton
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Updating..."
                    >
                        Update Password
                    </AuthButton>
                </div>
            </form>
        </AuthLayout>
    )
}
