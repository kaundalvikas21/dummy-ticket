"use client"

import { Plane, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export function AuthLayout({ children, title, description, backLink, isLoading = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <Header />

      {/* Main Content - Centered auth card with balanced spacing */}
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-teal-50/40" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-transparent rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">
          {/* Card with glassmorphism effect */}
          <div className="shadow-2xl border-0 backdrop-blur-lg bg-white/95 ring-1 ring-white/20 rounded-2xl overflow-hidden relative">
            {/* Loading Bar */}
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-1 z-20 overflow-hidden bg-gray-100">
                <div className="h-full w-full bg-gradient-to-r from-blue-600 to-teal-400 animate-progress-loading" />
              </div>
            )}

            {/* Header Section */}
            <div className="space-y-6 pb-6 pt-8 px-8">
              {/* Logo */}
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-600 to-teal-400 p-3 rounded-xl shadow-lg">
                  <Plane className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-gray-600 font-medium">
                  {description}
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 pb-8">
              {children}
            </div>

            {/* Footer Section */}
            {backLink && (
              <div className="px-8 pb-6 text-center">
                <Link
                  href={backLink.href}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {backLink.text}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
