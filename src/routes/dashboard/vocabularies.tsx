import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { BookOpen, Edit, Filter, Plus, Trash2, X } from 'lucide-react'
import {
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  Input,
  LoadingSpinner,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
} from '../../shared/components'
import {
  useCreateVocab,
  useDeleteVocab,
  useUpdateVocab,
  useVocabStats,
  useVocabularies,
} from '../../features/vocab'
import type {
  CreateVocabRequest,
  UpdateVocabRequest,
  Vocabulary,
  VocabularyStatus,
} from '../../features/vocab'

type SearchParams = {
  action?: string
}

export const Route = createFileRoute('/dashboard/vocabularies')({
  component: VocabulariesPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      action: (search.action as string) || undefined,
    }
  },
})

function VocabulariesPage() {
  const search = useSearch({ from: '/dashboard/vocabularies' })

  // URL state management with nuqs
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const [searchQuery, setSearchQuery] = useQueryState('search', parseAsString.withDefault(''))
  const [statusFilter, setStatusFilter] = useQueryState('status', parseAsString.withDefault(''))

  // Local state
  const [showAddModal, setShowAddModal] = useState(search.action === 'add')
  const [editingVocab, setEditingVocab] = useState<Vocabulary | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1)
    }
  }, [debouncedSearch, statusFilter])

  const { data, isLoading } = useVocabularies({
    page,
    pageSize: 10,
    search: debouncedSearch,
    status: statusFilter as VocabularyStatus | 'all' | '',
  })
  const { data: statsData } = useVocabStats()
  const createVocab = useCreateVocab()
  const updateVocab = useUpdateVocab()
  const deleteVocab = useDeleteVocab()

  const vocabularies = data?.data?.data || []
  const totalPages = data?.data?.total_pages || 1
  const total = data?.data?.total || 0
  const stats = statsData?.data

  const handleCreate = (formData: CreateVocabRequest) => {
    createVocab.mutate(formData, {
      onSuccess: () => {
        setShowAddModal(false)
      },
    })
  }

  const handleUpdate = (id: string, formData: UpdateVocabRequest) => {
    updateVocab.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          setEditingVocab(null)
        },
      },
    )
  }

  const handleDelete = (id: string) => {
    deleteVocab.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null)
      },
    })
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vocabularies"
        description="Manage your vocabulary collection"
        action={
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus className="w-5 h-5" />
            Add Word
          </Button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Words</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.learning}</div>
            <div className="text-sm text-gray-400">Learning</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.memorized}</div>
            <div className="text-sm text-gray-400">Memorized</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search vocabularies..."
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-slate-600' : ''}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="w-2 h-2 bg-cyan-500 rounded-full" />}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Status</option>
                <option value="learning">Learning</option>
                <option value="memorized">Memorized</option>
              </select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleClearFilters} className="self-end">
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Info */}
      {(searchQuery || statusFilter) && (
        <div className="text-sm text-gray-400">
          Showing {total} result{total !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
          {statusFilter && ` in ${statusFilter}`}
        </div>
      )}

      {/* Vocabularies List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : vocabularies.length > 0 ? (
        <>
          <div className="grid gap-4">
            {vocabularies.map((vocab: Vocabulary) => (
              <Card key={vocab.id} className="hover:border-slate-600 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-white wrap-break-word">
                        {vocab.word}
                      </h3>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                          vocab.status === 'memorized'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {vocab.status}
                      </span>
                    </div>
                    {vocab.translation && (
                      <p className="text-cyan-400 mb-2 text-sm sm:text-base wrap-break-word">
                        {vocab.translation}
                      </p>
                    )}
                    {vocab.definition && (
                      <p className="text-gray-300 mb-2 text-sm sm:text-base wrap-break-word">
                        {vocab.definition}
                      </p>
                    )}
                    {vocab.example && vocab.example.length > 0 && (
                      <div className="mt-3">
                        <p className="text-gray-500 text-xs sm:text-sm mb-1">Examples:</p>
                        <ul className="list-disc list-inside text-gray-400 text-xs sm:text-sm">
                          {vocab.example.map((ex, idx) => (
                            <li key={idx} className="wrap-break-word">
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-xs sm:text-sm text-gray-500">
                      <span>Tests: {vocab.test_count}</span>
                      <span className="text-green-400">Passed: {vocab.passed_test_count}</span>
                      <span className="text-red-400">Failed: {vocab.failed_test_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => setEditingVocab(vocab)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(vocab.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No vocabularies found"
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Start building your vocabulary collection'
          }
          action={
            hasActiveFilters ? (
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            ) : (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-5 h-5" />
                Add your first word
              </Button>
            )
          }
        />
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingVocab) && (
        <VocabModal
          vocab={editingVocab}
          onClose={() => {
            setShowAddModal(false)
            setEditingVocab(null)
          }}
          onSubmit={(formData) => {
            if (editingVocab) {
              handleUpdate(editingVocab.id, formData)
            } else {
              handleCreate(formData as CreateVocabRequest)
            }
          }}
          isLoading={createVocab.isPending || updateVocab.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Vocabulary"
        message="Are you sure you want to delete this vocabulary? This action cannot be undone."
        confirmText="Delete"
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        isLoading={deleteVocab.isPending}
        variant="danger"
      />
    </div>
  )
}

// Vocab Modal Component
interface VocabModalProps {
  vocab: Vocabulary | null
  onClose: () => void
  onSubmit: (data: CreateVocabRequest | UpdateVocabRequest) => void
  isLoading: boolean
}

function VocabModal({ vocab, onClose, onSubmit, isLoading }: VocabModalProps) {
  const [word, setWord] = useState(vocab?.word || '')
  const [definition, setDefinition] = useState(vocab?.definition || '')
  const [translation, setTranslation] = useState(vocab?.translation || '')
  const [examples, setExamples] = useState<Array<string>>(vocab?.example || [])
  const [newExample, setNewExample] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      word,
      definition,
      translation,
      example: examples.length > 0 ? examples : undefined,
    })
  }

  const addExample = () => {
    if (newExample.trim()) {
      setExamples([...examples, newExample.trim()])
      setNewExample('')
    }
  }

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  return (
    <Modal isOpen onClose={onClose} title={vocab ? 'Edit Vocabulary' : 'Add New Vocabulary'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Word"
          type="text"
          value={word}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWord(e.target.value)}
          placeholder="Enter the word"
          required
        />

        <Input
          label="Translation"
          type="text"
          value={translation}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTranslation(e.target.value)}
          placeholder="Enter the translation"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Definition</label>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Enter the definition"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Examples</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              placeholder="Add an example sentence"
              onKeyUp={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
            />
            <Button type="button" variant="secondary" onClick={addExample}>
              Add
            </Button>
          </div>
          {examples.length > 0 && (
            <div className="space-y-2">
              {examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <span className="text-gray-300 text-sm">{ex}</span>
                  <button
                    type="button"
                    onClick={() => removeExample(idx)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!word.trim()}
            isLoading={isLoading}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
