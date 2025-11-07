"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { User, Mail, Lock, Phone } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { SelectInput } from '@/components/ui/input/SelectInput'

const nationalityOptions = [
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "SG", label: "Singapore" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "NZ", label: "New Zealand" },
  { value: "KR", label: "South Korea" },
  { value: "BR", label: "Brazil" },
  { value: "ZA", label: "South Africa" },
  { value: "MX", label: "Mexico" },
  { value: "TH", label: "Thailand" },
]

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  nationality: z.string().optional(),
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
    watch,
    setValue,
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
        phoneNumber: data.phoneNumber?.trim() || '',
        nationality: data.nationality || '',
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
      <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3">
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Personal Information Section */}
        <div className="space-y-2 p-3 bg-gray-50/30 rounded-lg border border-gray-100">
          <h3 className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mb-1">
            <User className="h-3.5 w-3.5 text-gray-500" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
        </div>

        {/* Contact Details Section */}
        <div className="space-y-2 p-3 bg-gray-50/30 rounded-lg border border-gray-100">
          <h3 className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mb-1">
            <Mail className="h-3.5 w-3.5 text-gray-500" />
            Contact Details
          </h3>
          <div className="space-y-2">
            <FormField
              id="registerEmail"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
              {...registerForm('email')}
              error={registerErrors.email?.message}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <FormField
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                icon={Phone}
                {...registerForm('phoneNumber')}
                error={registerErrors.phoneNumber?.message}
              />
              <SelectInput
                label="Nationality"
                value={watch('nationality') || ''}
                onValueChange={(value) => setValue('nationality', value)}
                options={nationalityOptions}
                placeholder="Select nationality"
                error={registerErrors.nationality?.message}
              />
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="space-y-2 p-3 bg-gray-50/30 rounded-lg border border-gray-100">
          <h3 className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mb-1">
            <Lock className="h-3.5 w-3.5 text-gray-500" />
            Account Security
          </h3>
          <div className="space-y-2">
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
          </div>
        </div>

        <div className="pt-1">
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