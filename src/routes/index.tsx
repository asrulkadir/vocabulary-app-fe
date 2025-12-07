import { Link, createFileRoute } from '@tanstack/react-router'
import { BookOpen, Brain, CheckCircle, Zap } from 'lucide-react'
import { useAuthStore } from '../features/auth'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: <BookOpen className="w-12 h-12 text-cyan-400" />,
      title: 'Build Your Vocabulary',
      description:
        'Add new words easily and organize them in your personal collection. Track your progress as you learn.',
    },
    {
      icon: <Brain className="w-12 h-12 text-cyan-400" />,
      title: 'Smart Testing',
      description:
        'Test yourself with essay or multiple-choice questions. Our system adapts to help you memorize effectively.',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-cyan-400" />,
      title: 'Track Progress',
      description:
        'See your learning statistics at a glance. Know which words you\'ve mastered and which need more practice.',
    },
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: 'Automatic Memorization',
      description:
        'Words are automatically marked as memorized when you pass tests consistently. Focus on what matters.',
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-cyan-400" />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-0.04em]">
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Vocabulary
              </span>{' '}
              <span className="text-gray-300">App</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Master new words, one at a time
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            Build your vocabulary with our smart learning system. Add words, test yourself,
            and track your progress. Perfect for language learners and anyone looking to
            expand their word knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Everything you need to learn vocabulary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Add Words</h3>
              <p className="text-gray-400">
                Add new vocabulary with definitions, examples, and translations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Test Yourself</h3>
              <p className="text-gray-400">
                Take tests with essay or multiple-choice questions to reinforce learning.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
              <p className="text-gray-400">
                Monitor your learning and see words automatically marked as memorized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to expand your vocabulary?
          </h2>
          <p className="text-gray-400 mb-8">
            Join now and start building your word knowledge today.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              Start Learning Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Vocabulary App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}