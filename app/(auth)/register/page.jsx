"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { User, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onRegister = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      // Show loading toast
      toast({
        title: "Creating Account",
        description: "Please wait while we set up your account...",
      })

      // Prepare the registration data - now using separate fields
      const registrationData = {
        // User data
        email: data.email,
        password: data.password,
        role: 'user', // Default role for new registrations

        // Profile data - directly from form fields
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        // Other profile fields will be filled from dashboard profile
      }

      console.log('Registration data:', registrationData)

      // Call register function from auth context
      const result = await register(registrationData)

      if (result.success) {
        resetRegisterForm()

        // Show success toast
        toast({
          title: "Account Created Successfully! 🎉",
          description: `Welcome to VisaFly, ${data.firstName}! Redirecting to your dashboard...`,
        })

        // Redirect to user dashboard profile after a short delay
        setTimeout(() => {
          router.push('/user/profile')
        }, 2000)
      } else {
        // Show error toast
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error || 'Registration failed. Please try again.',
        })
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      // Show error toast
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.message || 'Registration failed. Please try again.',
      })
      setError(error.message || 'Registration failed. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      description="Sign up to get started with VisaFly"
    >
      <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Name Fields - Separate First and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            icon={User}
            {...registerForm('firstName')}
            error={registerErrors.firstName?.message}
          />
          <FormField
            id="lastName"
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            icon={User}
            {...registerForm('lastName')}
            error={registerErrors.lastName?.message}
          />
        </div>

        <FormField
          id="registerEmail"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          {...registerForm('email')}
          error={registerErrors.email?.message}
        />

        <FormField
          id="registerPassword"
          label="Password"
          type="password"
          placeholder="Create a password"
          icon={Lock}
          showPasswordToggle={true}
          {...registerForm('password')}
          error={registerErrors.password?.message}
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          icon={Lock}
          showPasswordToggle={true}
          {...registerForm('confirmPassword')}
          error={registerErrors.confirmPassword?.message}
        />

        <div className="pt-4">
          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Creating Account..."
          >
            Create Account
          </AuthButton>
        </div>
      </form>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}