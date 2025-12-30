/**
 * Tracking Landing Page
 * Allows clients to enter their tracking code to view project progress
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function TrackingLandingPage() {
  const [trackingCode, setTrackingCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = trackingCode.trim().toUpperCase()
    if (code) {
      navigate(`/track/${code}`)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-lg px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <ClipboardList className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">
            Track Your Project
          </h1>
          <p className="text-lg text-zinc-400">
            Enter your tracking code to view real-time project progress
          </p>
        </div>

        {/* Tracking Code Form */}
        <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Enter Tracking Code</CardTitle>
            <CardDescription>
              Your tracking code was provided by your project manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="e.g., ABC123XYZ"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="pl-10 h-12 text-lg font-mono bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 uppercase tracking-wider"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-lg"
                disabled={!trackingCode.trim()}
              >
                View Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have a tracking code?{' '}
          <a href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Contact us
          </a>{' '}
          for assistance.
        </p>
      </div>
    </div>
  )
}

