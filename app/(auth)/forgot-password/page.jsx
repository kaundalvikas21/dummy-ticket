"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState({ type: null, message: '' })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        setStatus({ type: null, message: '' })

        try {
            // First check if the email exists
            const checkResponse = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
            })

            const checkResult = await checkResponse.json()

            if (!checkResponse.ok) {
                console.error('Email check failed', checkResult)
                // Continue to try reset even if check failed to avoid blocking, 
                // OR handle error. Given the requirement is to improve UX, we likely want to proceed defensively 
                // but if the API fails, we might fall back to "User not found" or generic error.
                // Let's assume if API fails, we show generic error.
                throw new Error('Failed to validate email')
            }

            if (!checkResult.exists) {
                setStatus({
                    type: 'error',
                    message: "This email address is not associated with any account."
                })
                setIsLoading(false)
                return
            }

            // If user exists, proceed with reset
            const result = await resetPassword(data.email)

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: "We've sent a password reset link to your email address."
                })
                reset()
            } else {
                setStatus({
                    type: 'error',
                    message: result.error || 'Failed to send reset email'
                })
            }
        } catch (error) {
            console.error(error)
            setStatus({
                type: 'error',
                message: "An unexpected error occurred"
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
                {status.message && (
                    <div
                        className={`p-4 rounded-xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${status.type === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-100/50'
                            : 'bg-red-50 text-red-900 border border-red-100/50'
                            }`}
                    >
                        {status.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium leading-relaxed">
                            {status.message}
                        </p>
                    </div>
                )}

                <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="admin@example.com"
                    icon={Mail}
                    {...register('email')}
                    error={errors.email?.message}
                />

                <div className="pt-2">
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
