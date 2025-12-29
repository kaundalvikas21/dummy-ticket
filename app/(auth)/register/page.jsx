"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { AuthButton } from '@/components/auth/AuthButton'
import { PhoneInputSingle } from '@/components/ui/input/PhoneInputSingle'
import { User, Mail, Lock, Phone } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { SelectInput } from '@/components/ui/input/SelectInput'
import { countries } from '@/lib/countries'

const nationalityOptions = [
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "India", label: "India" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
  { value: "Spain", label: "Spain" },
  { value: "Japan", label: "Japan" },
  { value: "China", label: "China" },
  { value: "Singapore", label: "Singapore" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "South Korea", label: "South Korea" },
  { value: "Brazil", label: "Brazil" },
  { value: "South Africa", label: "South Africa" },
  { value: "Mexico", label: "Mexico" },
  { value: "Thailand", label: "Thailand" },
  { value: "Russia", label: "Russia" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Netherlands", label: "Netherlands" },
]

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  country_code: z.string().min(1, 'Select country code'),
  phone_number: z.string().min(5, 'Phone number too short').regex(/^\d+$/, 'Digits only'),
  nationality: z.string().min(1, 'Nationality is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const { register } = useAuth()  // Temporarily revert to register method
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
    defaultValues: {
      country_code: '+1',
      phone_number: ''
    }
  })

  // Derive priority country code from selected nationality
  const selectedNationality = watch('nationality')
  const getPriorityCountryCode = () => {
    if (!selectedNationality) return undefined
    const country = countries.find(c => c.name === selectedNationality)
    return country?.code
  }

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
        phoneNumber: data.phone_number || '',
        countryCode: data.country_code || '+1',
        nationality: data.nationality || '',
        // Other profile fields will be filled from dashboard profile
      }

      console.log('Registration data:', registrationData)

      // Call register function from auth context (original format)
      const result = await register(registrationData)

      if (result.success) {
        resetRegisterForm()

        // Check if email confirmation is required
        if (result.data?.user?.email_confirmed_at) {
          // User already confirmed, redirect to dashboard
          toast({
            title: "Account Created Successfully! 🎉",
            description: `Welcome to VisaFly, ${data.firstName}! Redirecting to your dashboard...`,
          })

          setTimeout(() => {
            router.push('/user/profile')
          }, 2000)
        } else {
          // Email confirmation required
          toast({
            title: "Registration Successful! 📧",
            description: `Welcome ${data.firstName}! Please check your email to confirm your account.`,
          })

          setTimeout(() => {
            router.push('/login?message=Please check your email to confirm your account')
          }, 3000)
        }
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
      isLoading={isLoading}
    >
      <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Personal Information - Compact inline header with 2-col grid */}
        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
            <User className="h-3 w-3" />
            Personal Info
          </span>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="firstName"
              label="First Name"
              type="text"
              placeholder="First name"
              icon={User}
              {...registerForm('firstName')}
              error={registerErrors.firstName?.message}
            />
            <FormField
              id="lastName"
              label="Last Name"
              type="text"
              placeholder="Last name"
              icon={User}
              {...registerForm('lastName')}
              error={registerErrors.lastName?.message}
            />
          </div>
        </div>

        {/* Contact Details - Optimized layout for phone input visibility */}
        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
            <Mail className="h-3 w-3" />
            Contact
          </span>
          {/* Email and Nationality in 2-column grid (simple single inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              id="registerEmail"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              {...registerForm('email')}
              error={registerErrors.email?.message}
            />
            <SelectInput
              label="Nationality"
              value={watch('nationality') || ''}
              onValueChange={(value) => {
                setValue('nationality', value)

                // Find matching country by name to auto-select code
                const country = countries.find(c => c.name === value)
                if (country) {
                  setValue('country_code', country.dialCode)
                }
              }}
              options={nationalityOptions}
              placeholder="Select nationality"
              error={registerErrors.nationality?.message}
              required
            />
          </div>
          {/* Phone gets full width - has country code dropdown + input */}
          <div className="mt-3">
            <PhoneInputSingle
              value={{
                countryCode: watch('country_code'),
                phoneNumber: watch('phone_number')
              }}
              onChange={(value) => {
                setValue('country_code', value.countryCode)
                setValue('phone_number', value.phoneNumber)
              }}
              label="Phone Number"
              priorityCountryCode={getPriorityCountryCode()}
              required
              placeholder="Phone number"
              error={registerErrors.country_code?.message || registerErrors.phone_number?.message}
            />
          </div>
        </div>

        {/* Account Security - Password fields side by side on larger screens */}
        <div>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
            <Lock className="h-3 w-3" />
            Security
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              id="registerPassword"
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              icon={Lock}
              showPasswordToggle={true}
              {...registerForm('password')}
              error={registerErrors.password?.message}
            />
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              icon={Lock}
              showPasswordToggle={true}
              {...registerForm('confirmPassword')}
              error={registerErrors.confirmPassword?.message}
            />
          </div>
        </div>

        <AuthButton
          type="submit"
          isLoading={isLoading}
          loadingText="Creating Account..."
        >
          Create Account
        </AuthButton>
      </form>

      {/* Login Link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
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