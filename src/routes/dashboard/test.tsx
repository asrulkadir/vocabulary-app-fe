import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Brain,
  CheckCircle,
  ChevronRight,
  ListChecks,
  Pen,
  Trophy,
  XCircle,
} from 'lucide-react'
import { Button, Card, EmptyState, LoadingSpinner } from '../../shared/components'
import {
  useRandomVocabulary,
  useSubmitTestAnswer,
  useTestOptions,
  useVocabStats,
} from '../../features/vocab'
import type {
  TestOption,
  TestResultResponse,
  VocabularyStatus,
} from '../../features/vocab'

export const Route = createFileRoute('/dashboard/test')({
  component: TestPage,
})

type TestMode = 'select' | 'essay' | 'multiple-choice'
type StatusFilter = VocabularyStatus | 'all'

function TestPage() {
  const [mode, setMode] = useState<TestMode>('select')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [userAnswer, setUserAnswer] = useState('')
  const [options, setOptions] = useState<Array<TestOption>>([])
  const [result, setResult] = useState<TestResultResponse | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showScore, setShowScore] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)

  // Fetch vocabulary stats
  const { data: statsData, isLoading: isLoadingStats } = useVocabStats()

  // Fetch random vocabulary for test
  const {
    data: randomVocabData,
    isLoading: isLoadingRandom,
    refetch: fetchNextVocab,
    isError: noVocabsError,
  } = useRandomVocabulary(statusFilter, testStarted && mode !== 'select')

  const currentVocab = randomVocabData?.data

  // Fetch test options for multiple choice
  const { data: testOptionsData, isLoading: isLoadingOptions } = useTestOptions(
    currentVocab?.id || '',
    mode === 'multiple-choice' && !!currentVocab && !result,
  )

  const submitAnswer = useSubmitTestAnswer()

  const stats = statsData?.data

  // Memoize filtered count based on stats
  const getFilteredCount = useMemo(() => {
    if (!stats) return 0
    if (statusFilter === 'all') return stats.total
    if (statusFilter === 'learning') return stats.learning
    return stats.memorized
  }, [stats, statusFilter])

  // Set options when test options data loads
  useEffect(() => {
    if (testOptionsData?.data?.options && mode === 'multiple-choice' && !result) {
      setOptions(testOptionsData.data.options)
    }
  }, [testOptionsData, mode, result])

  const startTest = (selectedMode: TestMode) => {
    setMode(selectedMode)
    setTestStarted(true)
    setScore({ correct: 0, total: 0 })
    setShowScore(false)
    setResult(null)
    setUserAnswer('')
    setQuestionCount(0)
    setOptions([])
  }

  const checkAnswer = async () => {
    if (!currentVocab || !userAnswer.trim()) return

    try {
      const response = await submitAnswer.mutateAsync({
        id: currentVocab.id,
        data: { input: userAnswer.trim() },
      })

      const testResult = response.data
      if (testResult) {
        setResult(testResult)
        setScore((prev) => ({
          correct: prev.correct + (testResult.passed ? 1 : 0),
          total: prev.total + 1,
        }))
        setQuestionCount((prev) => prev + 1)
      }
    } catch {
      // Handle error silently - mutation errors are handled by React Query
    }
  }

  const selectOption = async (option: TestOption) => {
    if (result || !currentVocab) return

    setUserAnswer(option.translation)

    try {
      const response = await submitAnswer.mutateAsync({
        id: currentVocab.id,
        data: { input: option.translation },
      })

      const testResult = response.data
      if (testResult) {
        setResult(testResult)
        setScore((prev) => ({
          correct: prev.correct + (testResult.passed ? 1 : 0),
          total: prev.total + 1,
        }))
        setQuestionCount((prev) => prev + 1)
      }
    } catch {
      // Handle error silently
    }
  }

  const nextQuestion = async () => {
    setResult(null)
    setUserAnswer('')
    setOptions([])

    // Check if we should end the test (after answering all available vocabs)
    if (questionCount >= getFilteredCount) {
      setShowScore(true)
      return
    }

    // Fetch next random vocabulary
    await fetchNextVocab()
  }

  const resetTest = () => {
    setMode('select')
    setTestStarted(false)
    setResult(null)
    setUserAnswer('')
    setOptions([])
    setScore({ correct: 0, total: 0 })
    setShowScore(false)
    setQuestionCount(0)
  }

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No vocabularies to test"
        description="Add some vocabularies first to start testing."
        action={
          <Link
            to="/dashboard/vocabularies"
            search={{}}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
          >
            Add Vocabularies
          </Link>
        }
      />
    )
  }

  // Score Screen
  if (showScore) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <div className="max-w-xl mx-auto px-2">
        <Card className="text-center">
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Test Complete!</h2>
          <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Here's how you did:</p>

          <div className="bg-slate-700/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {score.correct} / {score.total}
            </div>
            <div className="text-lg sm:text-xl text-gray-400">{percentage}% Correct</div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8 text-sm sm:text-base">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{score.correct} correct</span>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{score.total - score.correct} incorrect</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Button variant="secondary" onClick={resetTest}>
              Back to Selection
            </Button>
            <Button onClick={() => startTest(mode)}>Try Again</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Mode Selection
  if (mode === 'select') {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Vocabulary Test</h1>
          <p className="text-gray-400 text-sm sm:text-base">Choose your test mode and vocabulary filter</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-800 rounded-lg p-1">
            {[
              { value: 'all', label: 'All', count: stats.total },
              { value: 'learning', label: 'Learning', count: stats.learning },
              { value: 'memorized', label: 'Memorized', count: stats.memorized },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as StatusFilter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {getFilteredCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No {statusFilter === 'all' ? '' : statusFilter} vocabularies available for testing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {/* Essay Mode */}
            <button
              onClick={() => startTest('essay')}
              className="bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 sm:p-6 text-left transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-cyan-400/10 rounded-lg">
                  <Pen className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                </div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 ml-auto group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Essay Mode</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Type the translation of the shown word. Tests your active recall.
              </p>
            </button>

            {/* Multiple Choice Mode */}
            <button
              onClick={() => startTest('multiple-choice')}
              disabled={(stats.total || 0) < 4}
              className="bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 sm:p-6 text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-400/10 rounded-lg">
                  <ListChecks className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 ml-auto group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Multiple Choice</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Select the correct translation from 4 options. Perfect for quick review.
              </p>
              {(stats.total || 0) < 4 && (
                <p className="text-red-400 text-sm mt-2">Need at least 4 vocabularies</p>
              )}
            </button>
          </div>
        )}

        {/* Stats */}
        <Card className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.total || 0}</p>
            </div>
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm">Learning</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.learning || 0}</p>
            </div>
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm">Memorized</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.memorized || 0}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Loading state for test
  if (isLoadingRandom || !currentVocab) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // No vocabularies available for the selected filter
  if (noVocabsError) {
    return (
      <EmptyState
        icon={Brain}
        title="No vocabularies available"
        description={`No ${statusFilter === 'all' ? '' : statusFilter} vocabularies available for testing.`}
        action={
          <Button onClick={resetTest} variant="secondary">
            Back to Selection
          </Button>
        }
      />
    )
  }

  // Test Screen
  return (
    <div className="max-w-2xl mx-auto px-2">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 text-sm sm:text-base">
        <button onClick={resetTest} className="text-gray-400 hover:text-white transition-colors">
          ← Back
        </button>
        <div className="text-gray-400 text-xs sm:text-base">
          Question {questionCount + 1}
          <span className="ml-2 px-2 py-0.5 rounded bg-slate-700 text-xs capitalize">
            {statusFilter}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-green-400">{score.correct} ✓</span>
          <span className="text-red-400">{score.total - score.correct} ✗</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-gray-400 text-xs sm:text-sm mb-2">What is the translation of:</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white">{currentVocab.word}</h2>
        </div>

        {/* Essay Mode */}
        {mode === 'essay' && (
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={result !== null || submitAnswer.isPending}
              onKeyUp={(e) => e.key === 'Enter' && !result && !submitAnswer.isPending && checkAnswer()}
              className={`w-full px-4 py-4 text-lg text-center rounded-lg border focus:outline-none ${
                result?.passed
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : result && !result.passed
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-slate-700 border-slate-600 text-white focus:border-cyan-500'
              }`}
              placeholder="Type your answer..."
            />

            {result && (
              <div className={`p-4 rounded-lg ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.passed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-medium">Incorrect</span>
                    </>
                  )}
                </div>
                {!result.passed && result.correct_answer && (
                  <p className="text-gray-300">
                    Correct answer:{' '}
                    <span className="text-white font-medium">{result.correct_answer}</span>
                  </p>
                )}
              </div>
            )}

            {!result ? (
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer.trim() || submitAnswer.isPending}
                fullWidth
              >
                {submitAnswer.isPending ? 'Checking...' : 'Check Answer'}
              </Button>
            ) : (
              <Button onClick={nextQuestion} fullWidth>
                Next Question →
              </Button>
            )}
          </div>
        )}

        {/* Multiple Choice Mode */}
        {mode === 'multiple-choice' && (
          <div className="space-y-4">
            {isLoadingOptions ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="grid gap-3">
                {options.map((option, idx) => {
                  const isSelected = userAnswer === option.translation
                  const isCorrect = result && result.passed && isSelected

                  let buttonClass = 'bg-slate-700 border-slate-600 hover:border-cyan-500'
                  if (result) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-500/20 border-green-500 text-green-400'
                    } else if (isSelected && !result.passed) {
                      buttonClass = 'bg-red-500/20 border-red-500 text-red-400'
                    } else if (option.translation === result.correct_answer) {
                      buttonClass = 'bg-green-500/20 border-green-500 text-green-400'
                    } else {
                      buttonClass = 'bg-slate-700/50 border-slate-600 opacity-50'
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => selectOption(option)}
                      disabled={result !== null || submitAnswer.isPending}
                      className={`w-full px-4 py-4 text-left rounded-lg border transition-all ${buttonClass}`}
                    >
                      <span className="text-gray-400 mr-3">{String.fromCharCode(65 + idx)}.</span>
                      <span className={result ? '' : 'text-white'}>{option.translation}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {result && (
              <Button onClick={nextQuestion} fullWidth>
                Next Question →
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
