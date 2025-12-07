import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Brain,
  CheckCircle,
  ChevronRight,
  ListChecks,
  Pen,
  Trophy,
  XCircle,
} from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
} from '../../shared/components'
import { useAllVocabularies, useUpdateTestResult } from '../../features/vocab'
import type { Vocabulary } from '../../features/vocab'

export const Route = createFileRoute('/dashboard/test')({
  component: TestPage,
})

type TestMode = 'select' | 'essay' | 'multiple-choice'
type TestResult = 'correct' | 'incorrect' | null

function TestPage() {
  const { data, isLoading } = useAllVocabularies()
  const updateTestResult = useUpdateTestResult()

  const [mode, setMode] = useState<TestMode>('select')
  const [currentVocab, setCurrentVocab] = useState<Vocabulary | null>(null)
  const [availableVocabs, setAvailableVocabs] = useState<Array<Vocabulary>>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [options, setOptions] = useState<Array<string>>([])
  const [result, setResult] = useState<TestResult>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showScore, setShowScore] = useState(false)

  const vocabularies = data?.data?.data || []
  const learningVocabs = vocabularies.filter((v: Vocabulary) => v.status === 'learning')

  // Initialize available vocabs when data loads or mode changes
  useEffect(() => {
    if (vocabularies.length > 0 && mode !== 'select') {
      setAvailableVocabs([...vocabularies])
      pickNextVocab([...vocabularies])
    }
  }, [mode, vocabularies.length])

  const pickNextVocab = (vocabs: Array<Vocabulary>) => {
    if (vocabs.length === 0) {
      setShowScore(true)
      return
    }

    const randomIndex = Math.floor(Math.random() * vocabs.length)
    const vocab = vocabs[randomIndex]
    setCurrentVocab(vocab)
    setResult(null)
    setUserAnswer('')

    // For multiple choice, generate options
    if (mode === 'multiple-choice') {
      const correctAnswer = vocab.translation || vocab.definition || ''
      const otherVocabs = vocabularies.filter((v: Vocabulary) => v.id !== vocab.id)
      const wrongOptions: Array<string> = []

      // Get 3 random wrong answers
      while (wrongOptions.length < 3 && otherVocabs.length > 0) {
        const randIdx = Math.floor(Math.random() * otherVocabs.length)
        const wrongVocab = otherVocabs[randIdx]
        const wrongAnswer = wrongVocab.translation || wrongVocab.definition || ''
        if (wrongAnswer && !wrongOptions.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
          wrongOptions.push(wrongAnswer)
        }
        otherVocabs.splice(randIdx, 1)
      }

      // Shuffle options
      const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5)
      setOptions(allOptions)
    }
  }

  const checkAnswer = () => {
    if (!currentVocab) return

    const correctAnswer = currentVocab.translation || currentVocab.definition || ''
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

    setResult(isCorrect ? 'correct' : 'incorrect')
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    // Update test result in backend
    updateTestResult.mutate({
      id: currentVocab.id,
      data: { passed: isCorrect },
    })
  }

  const selectOption = (option: string) => {
    if (result) return // Already answered

    const correctAnswer = currentVocab?.translation || currentVocab?.definition || ''
    const isCorrect = option === correctAnswer

    setUserAnswer(option)
    setResult(isCorrect ? 'correct' : 'incorrect')
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    // Update test result in backend
    if (currentVocab) {
      updateTestResult.mutate({
        id: currentVocab.id,
        data: { passed: isCorrect },
      })
    }
  }

  const nextQuestion = () => {
    const remaining = availableVocabs.filter((v) => v.id !== currentVocab?.id)
    setAvailableVocabs(remaining)
    pickNextVocab(remaining)
  }

  const resetTest = () => {
    setMode('select')
    setCurrentVocab(null)
    setAvailableVocabs([])
    setResult(null)
    setUserAnswer('')
    setScore({ correct: 0, total: 0 })
    setShowScore(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (vocabularies.length === 0) {
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
    const percentage = Math.round((score.correct / score.total) * 100)
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
            <div className="text-lg sm:text-xl text-gray-400">
              {percentage}% Correct
            </div>
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
            <Button
              onClick={() => {
                setShowScore(false)
                setScore({ correct: 0, total: 0 })
                setAvailableVocabs([...vocabularies])
                pickNextVocab([...vocabularies])
              }}
            >
              Try Again
            </Button>
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
          <p className="text-gray-400 text-sm sm:text-base">Choose your test mode</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {/* Essay Mode */}
          <button
            onClick={() => setMode('essay')}
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
              Type the translation or definition of the shown word. Tests your active recall.
            </p>
          </button>

          {/* Multiple Choice Mode */}
          <button
            onClick={() => setMode('multiple-choice')}
            disabled={vocabularies.length < 4}
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
            {vocabularies.length < 4 && (
              <p className="text-red-400 text-sm mt-2">
                Need at least 4 vocabularies
              </p>
            )}
          </button>
        </div>

        {/* Stats */}
        <Card className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm">Total Vocabularies</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{vocabularies.length}</p>
            </div>
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm">Still Learning</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{learningVocabs.length}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Test Screen
  return (
    <div className="max-w-2xl mx-auto px-2">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 text-sm sm:text-base">
        <button
          onClick={resetTest}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="text-gray-400 text-xs sm:text-base">
          Question {score.total + 1} of {vocabularies.length}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-green-400">{score.correct} ✓</span>
          <span className="text-red-400">{score.total - score.correct} ✗</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-gray-400 text-xs sm:text-sm mb-2">What is the translation/definition of:</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-white">{currentVocab?.word}</h2>
        </div>

        {/* Essay Mode */}
        {mode === 'essay' && (
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={result !== null}
              onKeyPress={(e) => e.key === 'Enter' && !result && checkAnswer()}
              className={`w-full px-4 py-4 text-lg text-center rounded-lg border focus:outline-none ${
                result === 'correct'
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : result === 'incorrect'
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-700 border-slate-600 text-white focus:border-cyan-500'
              }`}
              placeholder="Type your answer..."
            />

            {result && (
              <div className={`p-4 rounded-lg ${result === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result === 'correct' ? (
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
                <p className="text-gray-300">
                  Correct answer: <span className="text-white font-medium">
                    {currentVocab?.translation || currentVocab?.definition}
                  </span>
                </p>
              </div>
            )}

            {!result ? (
              <Button onClick={checkAnswer} disabled={!userAnswer.trim()} fullWidth>
                Check Answer
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
            <div className="grid gap-3">
              {options.map((option, idx) => {
                const correctAnswer = currentVocab?.translation || currentVocab?.definition
                const isSelected = userAnswer === option
                const isCorrect = option === correctAnswer

                let buttonClass = 'bg-slate-700 border-slate-600 hover:border-cyan-500'
                if (result) {
                  if (isCorrect) {
                    buttonClass = 'bg-green-500/20 border-green-500 text-green-400'
                  } else if (isSelected) {
                    buttonClass = 'bg-red-500/20 border-red-500 text-red-400'
                  } else {
                    buttonClass = 'bg-slate-700/50 border-slate-600 opacity-50'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(option)}
                    disabled={result !== null}
                    className={`w-full px-4 py-4 text-left rounded-lg border transition-all ${buttonClass}`}
                  >
                    <span className="text-gray-400 mr-3">{String.fromCharCode(65 + idx)}.</span>
                    <span className={result ? '' : 'text-white'}>{option}</span>
                  </button>
                )
              })}
            </div>

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
