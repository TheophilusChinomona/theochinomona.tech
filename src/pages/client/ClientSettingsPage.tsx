/**
 * ClientSettingsPage
 * Client settings for profile, notifications, theme, and password
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { User, Bell, Palette, Lock, Save, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { updateUserProfile, changePassword } from '@/lib/db/users'
import { getUserPreferences, updateUserPreferences } from '@/lib/db/userPreferences'
import type { ThemePreference } from '@/lib/db/types/dashboard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security'

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Lock },
]

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    phone: user?.phone || '',
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: () => (user?.id ? getUserPreferences(user.id) : Promise.reject('No user')),
    enabled: !!user?.id,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; surname: string; phone: string }) =>
      user?.id ? updateUserProfile(user.id, data) : Promise.reject('No user'),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: { theme?: ThemePreference; email_notifications?: boolean }) =>
      user?.id ? updateUserPreferences(user.id, data) : Promise.reject('No user'),
    onSuccess: () => {
      toast.success('Preferences updated')
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preferences')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    changePasswordMutation.mutate(passwordForm.newPassword)
  }

  const handleThemeChange = (theme: ThemePreference) => {
    updatePreferencesMutation.mutate({ theme })
  }

  const handleEmailNotificationsChange = (enabled: boolean) => {
    updatePreferencesMutation.mutate({ email_notifications: enabled })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left',
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Profile Information</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Update your personal information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    First Name
                  </Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="bg-zinc-900 border-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-zinc-300">
                    Last Name
                  </Label>
                  <Input
                    id="surname"
                    value={profileForm.surname}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, surname: e.target.value }))
                    }
                    className="bg-zinc-900 border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-zinc-900 border-zinc-800 text-zinc-500"
                />
                <p className="text-xs text-zinc-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 123-4567"
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                  Notification Preferences
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Choose how you want to receive notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Email Notifications</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Receive email updates about your projects
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_notifications ?? true}
                    onCheckedChange={handleEmailNotificationsChange}
                    disabled={updatePreferencesMutation.isPending}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Appearance</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Customize how the dashboard looks for you.
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-300">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as ThemePreference[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      disabled={updatePreferencesMutation.isPending}
                      className={cn(
                        'p-4 rounded-lg border transition-all text-center capitalize',
                        preferences?.theme === theme
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                      )}
                    >
                      <span className="text-sm font-medium">{theme}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  Note: Theme switching will be fully implemented in a future update.
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Change Password</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Update your password to keep your account secure.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-zinc-300">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-300">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  changePasswordMutation.isPending ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {changePasswordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Change Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

