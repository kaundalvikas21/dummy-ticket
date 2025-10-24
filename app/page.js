
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dummy Ticket Booking
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Simple ticket booking system with Next.js 15.5.6
          </p>
          <div className="space-x-4">
            <Link
              href="/tickets"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Tickets
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
