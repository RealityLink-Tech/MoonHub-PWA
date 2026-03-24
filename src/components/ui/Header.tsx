// ============================================================
// Header Component
// 与参考项目完全一致
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  showAdd?: boolean
  onAddClick?: () => void
  onSearchClick?: () => void
  onSearch?: (query: string) => void
  className?: string
}

export function Header({
  title = '月枢',
  showAdd = false,
  onAddClick,
  onSearchClick,
  onSearch,
  className,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery('')
    }
    onSearchClick?.()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())
      console.log('Searching:', searchQuery)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-40 bg-slate-50/80 backdrop-blur-md shadow-sm shadow-blue-100/20',
        className
      )}
    >
      <div className="flex justify-between items-center h-16 px-6 w-full max-w-3xl mx-auto">
        {/* Search button / Close button */}
        <button
          onClick={handleSearchToggle}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/50 transition-colors rounded-full flex-shrink-0"
        >
          {showSearch ? (
            <X className="w-5 h-5 text-slate-700" />
          ) : (
            <Search className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* Title or Search input */}
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.form
              key="search"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              onSubmit={handleSearchSubmit}
              className="flex-1 mx-4 max-w-md"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索对话..."
                className="w-full px-4 py-2 rounded-full bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </motion.form>
          ) : (
            <motion.h1
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-bold tracking-tighter text-slate-800 drop-shadow-[0_0_8px_rgba(176,196,222,0.6)]"
            >
              {title}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Add button */}
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          {showAdd && (
            <button
              onClick={onAddClick}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/50 transition-colors rounded-full"
            >
              <Plus className="w-6 h-6 text-slate-700" />
            </button>
          )}
        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-b from-slate-200/20 to-transparent" />
    </header>
  )
}
