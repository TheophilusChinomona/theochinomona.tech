/**
 * Admin Settings Page
 * Placeholder for admin settings functionality
 */

import { Settings, Bell, Shield, Palette, Database } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const settingsSections = [
  {
    title: 'General Settings',
    description: 'Configure general site settings and preferences',
    icon: Settings,
    status: 'Coming Soon',
  },
  {
    title: 'Notifications',
    description: 'Manage email and push notification preferences',
    icon: Bell,
    status: 'Coming Soon',
  },
  {
    title: 'Security',
    description: 'Configure security settings and access controls',
    icon: Shield,
    status: 'Coming Soon',
  },
  {
    title: 'Appearance',
    description: 'Customize the look and feel of your site',
    icon: Palette,
    status: 'Coming Soon',
  },
  {
    title: 'Database',
    description: 'Manage database backups and migrations',
    icon: Database,
    status: 'Coming Soon',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 mt-1">
          Manage your admin dashboard and site settings
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <Card 
              key={section.title}
              className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-not-allowed opacity-60"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-zinc-800 rounded-lg w-fit">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                    {section.status}
                  </span>
                </div>
                <CardTitle className="text-lg text-zinc-100 mt-3">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500">
                  This feature is under development and will be available soon.
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Banner */}
      <Card className="bg-indigo-950/30 border-indigo-800/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-indigo-900/50 rounded-lg">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-indigo-200">Settings Coming Soon</h3>
              <p className="text-sm text-indigo-300/70 mt-1">
                We're working on bringing you a comprehensive settings panel. 
                Check back soon for new features and customization options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

