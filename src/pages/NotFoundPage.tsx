import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-zinc-800 animate-pulse">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-semibold text-white">Page Not Found</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-lg text-zinc-400">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-zinc-500">
            Don't worry, let's get you back on track.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/portfolio">
              <Search className="w-4 h-4 mr-2" />
              Portfolio
            </Link>
          </Button>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        {/* Decorative Elements */}
        <div className="pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            If you think this is an error, please{' '}
            <Link to="/contact" className="text-indigo-400 hover:text-indigo-300">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
