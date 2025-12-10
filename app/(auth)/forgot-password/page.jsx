"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data) => {
        setIsLoading(true)

        try {
            const result = await resetPassword(data.email)

            if (result.success) {
                toast({
                    title: "Email Sent",
                    description: "Check your email for the password reset link.",
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || 'Failed to send reset email',
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Reset Password"
            description="Enter your email to receive a password reset link"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="admin@example.com"
                    icon={Mail}
                    {...register('email')}
                    error={errors.email?.message}
                />

                <div className="pt-4">
                    <AuthButton
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Sending..."
                    >
                        Send Reset Link
                    </AuthButton>
                </div>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-6">
                <Link
                    href="/login"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>
            </div>
        </AuthLayout>
    )
}
