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
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, getRedirectUrl } = useAuth()  // Temporarily revert to login method
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      // First check if the email exists in our system
      // We use the check-email endpoint to verify if the user exists in user_profiles
      // This is safer than checking auth directly on client side
      // The endpoint is already implemented in /api/auth/check-email
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      })

      const checkResult = await checkResponse.json()

      // If user doesn't exist, stop here and prompt to register
      if (!checkResult.exists) {
        toast({
          variant: "destructive",
          title: "Account Not Found",
          description: (
            <div className="flex flex-col gap-2">
              <p>No account found with this email address.</p>
              <Link
                href={`/register?email=${encodeURIComponent(data.email)}`}
                className="underline hover:no-underline font-medium"
              >
                Create Account →
              </Link>
            </div>
          ),
        })
        setIsLoading(false)
        return
      }

      // If user exists, proceed with login
      const result = await login(data.email, data.password)

      if (result.success) {
        // Redirect to the appropriate dashboard based on user role
        const redirectUrl = getRedirectUrl()
        router.push(redirectUrl)
      } else {
        // Handle specific error messages
        // Since we already know the account exists, any login failure is likely a password issue
        // or account status issue (locked/inactive)

        let title = "Login Failed"
        let description = result.error || 'Invalid credentials'

        if (description.toLowerCase().includes('password') || description.toLowerCase().includes('credential')) {
          title = "Incorrect Password"
          description = "The password you entered is incorrect. Please try again or forgot your password."
        } else if (description.toLowerCase().includes('confirmed') || description.toLowerCase().includes('verify')) {
          title = "Email Not Verified"
          description = "Please verify your email address before logging in."
        }

        toast({
          variant: "destructive",
          title: title,
          description: description,
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome to VisaFly"
      description="Sign in to your account"
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

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          showPasswordToggle={true}
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex justify-end -mt-4 mb-4">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="pt-4">
          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </AuthButton>
        </div>
      </form>

      {/* Register Link */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}