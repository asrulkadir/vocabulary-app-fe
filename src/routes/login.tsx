import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuthStore, useLogin } from '../features/auth'
import {
  AuthLayout,
  Button,
  Card,
  ErrorAlert,
  Input,
  PasswordInput,
} from '../shared/components'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw new Error('Already authenticated')
    }
  },
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <AuthLayout>
      <Card className="bg-slate-800/50" padding="lg">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-400 text-center mb-6 text-sm sm:text-base">
          Sign in to continue learning
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <PasswordInput
            label="Password"
            id="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {login.isError && (
            <ErrorAlert message={login.error.message || 'Invalid email or password'} />
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={login.isPending}
            loadingText="Signing in..."
            className="py-3"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  )
}
