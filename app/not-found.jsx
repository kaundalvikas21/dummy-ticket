import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Plane} from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-32">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8 relative">
          <div className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 leading-none">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Plane className="w-16 h-16 md:w-24 md:h-24 text-blue-600 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Oops! Page Not Found</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Looks like this page took an unexpected detour. Don't worry, we'll help you get back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
            <Link href="/buy-ticket" className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Get Your Ticket
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
              My Dashboard
            </Link>
            <Link href="/buy-ticket" className="text-blue-600 hover:text-blue-700 hover:underline">
              Book Tickets
            </Link>
            <Link href="/faq" className="text-blue-600 hover:text-blue-700 hover:underline">
              FAQ
            </Link>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  )
}
