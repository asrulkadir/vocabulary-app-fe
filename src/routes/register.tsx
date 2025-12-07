import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore, useRegister } from '../features/auth'
import {
  AuthLayout,
  Button,
  ErrorAlert,
  Input,
  PasswordInput,
} from '../shared/components'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw new Error('Already authenticated')
    }
  },
})

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const register = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordError('')
    register.mutate({ name, email, password })
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start your vocabulary learning journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          id="name"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <Input
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <PasswordInput
          label="Password"
          id="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Create a password"
          required
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <PasswordInput
          label="Confirm Password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {(passwordError || register.isError) && (
          <ErrorAlert
            message={passwordError || register.error?.message || 'Registration failed. Please try again.'}
          />
        )}

        <Button
          type="submit"
          isLoading={register.isPending}
          loadingText="Creating account..."
          fullWidth
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
