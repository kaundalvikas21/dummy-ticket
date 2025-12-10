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
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, getRedirectUrl } = useAuth()  // Temporarily revert to login method
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState('')
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
    setError('')
    setErrorType('')

    try {
      const result = await login(data.email, data.password)

      if (result.success) {
        // Redirect to the appropriate dashboard based on user role
        const redirectUrl = getRedirectUrl()
        router.push(redirectUrl)
      } else {
        // Handle specific error messages
        const errorMessage = result.error || 'Login failed'

        if (errorMessage.includes('create an account')) {
          setError('You have to create an account')
          setErrorType('EMAIL_NOT_FOUND')
        } else if (errorMessage.includes('not active')) {
          setError('Your account is not active. Please contact support.')
          setErrorType('ACCOUNT_INACTIVE')
        } else {
          setError(errorMessage) // Generic message for wrong password
          setErrorType('INVALID_PASSWORD')
        }
      }
    } catch (error) {
      setError('An unexpected error occurred')
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              {errorType === 'EMAIL_NOT_FOUND' && (
                <div className="mt-2">
                  <Link
                    href="/register"
                    className="text-white underline hover:no-underline font-medium"
                  >
                    Create Account →
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
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