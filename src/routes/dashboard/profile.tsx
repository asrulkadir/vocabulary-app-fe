import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '../../features/auth'
import {
  Button,
  Card,
  Input,
  PageHeader,
} from '../../shared/components'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [isLoading] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Please login to view your profile.</p>
      </div>
    )
  }

  const handleSave = () => {
    // TODO: Implement profile update API
    setIsEditing(false)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your account settings"
      />

      <div className="max-w-2xl">
        <Card padding="none">
          {/* Header/Avatar Section */}
          <div className="bg-linear-to-r from-cyan-500/20 to-purple-500/20 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{user.name}</h2>
                <p className="text-gray-300 text-sm sm:text-base truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={handleSave}
                    isLoading={isLoading}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false)
                      setName(user.name || '')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <UserIcon className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white truncate">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white truncate">{user.email}</p>
                  </div>
                </div>

                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Account Section */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-700/50 rounded-lg">
              <div className="min-w-0">
                <p className="text-white font-medium">Change Password</p>
                <p className="text-gray-400 text-sm">Update your account password</p>
              </div>
              <Button variant="secondary" className="w-full sm:w-auto">
                Change
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="min-w-0">
                <p className="text-red-400 font-medium">Delete Account</p>
                <p className="text-gray-400 text-sm">Permanently delete your account and data</p>
              </div>
              <Button variant="danger" className="w-full sm:w-auto">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
