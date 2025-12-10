"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Lock } from 'lucide-react'

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function UpdatePasswordPage() {
    const router = useRouter()
    const { updateUserPassword } = useAuth()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(updatePasswordSchema),
    })

    const onSubmit = async (data) => {
        setIsLoading(true)

        try {
            const result = await updateUserPassword(data.password)

            if (result.success) {
                toast({
                    title: "Password Updated",
                    description: "Your password has been successfully updated. Redirecting to login...",
                })
                // Optional: Wait a bit before redirecting so user sees toast
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || 'Failed to update password',
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
