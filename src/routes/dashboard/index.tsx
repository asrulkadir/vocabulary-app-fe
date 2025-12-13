import { Link, createFileRoute } from '@tanstack/react-router'
import {
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Plus,
  TrendingUp,
} from 'lucide-react'
import {
  Card,
  EmptyState,
  LoadingSpinner,
  PageHeader,
} from '../../shared/components'
import { useVocabStats, useVocabularies } from '../../features/vocab'
import type { Vocabulary } from '../../features/vocab'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
})

function DashboardHome() {
  // Use stats hook for counts
  const { data: statsData, isLoading: isLoadingStats } = useVocabStats()
  // Use vocabularies hook for recent vocabs and test stats (fetch first page, sorted by created_at)
  const { data: vocabsData, isLoading: isLoadingVocabs } = useVocabularies({ 
    page: 1, 
    pageSize: 100 // Get enough for stats calculation
  })

  const isLoading = isLoadingStats || isLoadingVocabs
  const stats = statsData?.data
  const vocabularies = vocabsData?.data?.data || []
  
  // Calculate test stats from vocabularies
  const totalTests = vocabularies.reduce((sum: number, v: Vocabulary) => sum + v.test_count, 0)
  const passedTests = vocabularies.reduce((sum: number, v: Vocabulary) => sum + v.passed_test_count, 0)
  const failedTests = vocabularies.reduce((sum: number, v: Vocabulary) => sum + v.failed_test_count, 0)

  // Calculate vocabs added by period
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - today.getDay())
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const vocabsToday = vocabularies.filter((v: Vocabulary) => new Date(v.created_at) >= today).length
  const vocabsThisWeek = vocabularies.filter((v: Vocabulary) => new Date(v.created_at) >= thisWeekStart).length
  const vocabsThisMonth = vocabularies.filter((v: Vocabulary) => new Date(v.created_at) >= thisMonthStart).length

  // Recent vocabularies
  const recentVocabs = [...vocabularies]
    .sort((a: Vocabulary, b: Vocabulary) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const statCards = [
    {
      label: 'Total Vocabularies',
      value: stats?.total || 0,
      icon: BookOpen,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
    },
    {
      label: 'Memorized',
      value: stats?.memorized || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Learning',
      value: stats?.learning || 0,
      icon: Brain,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
    {
      label: 'Total Tests',
      value: totalTests,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ]

  const periodStats = [
    { label: 'Today', value: vocabsToday },
    { label: 'This Week', value: vocabsThisWeek },
    { label: 'This Month', value: vocabsThisMonth },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Track your vocabulary learning progress"
        action={
          <Link
            to="/dashboard/vocabularies"
            search={{ action: 'add' }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Word
          </Link>
        }
      />

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bg} w-fit`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Period Stats & Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Vocabularies Added */}
        <Card>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Vocabularies Added</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {periodStats.map((period) => (
              <div
                key={period.label}
                className="flex items-center justify-between p-3 sm:p-4 bg-slate-700/50 rounded-lg"
              >
                <span className="text-gray-300 text-sm sm:text-base">{period.label}</span>
                <span className="text-lg sm:text-xl font-bold text-white">{period.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Test Results */}
        <Card>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Test Results</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-500/10 rounded-lg">
              <span className="text-green-400 text-sm sm:text-base">Passed Tests</span>
              <span className="text-lg sm:text-xl font-bold text-green-400">{passedTests}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-red-500/10 rounded-lg">
              <span className="text-red-400 text-sm sm:text-base">Failed Tests</span>
              <span className="text-lg sm:text-xl font-bold text-red-400">{failedTests}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <span className="text-gray-300 text-sm sm:text-base">Success Rate</span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Vocabularies */}
      <Card>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Vocabularies</h2>
          <Link
            to="/dashboard/vocabularies"
            search={{}}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            View all →
          </Link>
        </div>
        {recentVocabs.length > 0 ? (
          <div className="space-y-3">
            {recentVocabs.map((vocab: Vocabulary) => (
              <div
                key={vocab.id}
                className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-700/50 rounded-lg"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{vocab.word}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">
                    {vocab.translation || vocab.definition || 'No definition'}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    vocab.status === 'memorized'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {vocab.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No vocabularies yet"
            action={
              <Link
                to="/dashboard/vocabularies"
                search={{ action: 'add' }}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Add your first word →
              </Link>
            }
          />
        )}
      </Card>
    </div>
  )
}
