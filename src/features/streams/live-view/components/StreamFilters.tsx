'use client'

import { Filter, Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'

interface StreamFiltersProps {
  totalCount: number
  filteredCount: number
}

type StreamStatus = 'all' | 'online' | 'offline'

export function StreamFilters({
  totalCount,
  filteredCount,
}: StreamFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentSearch = searchParams?.get('streamSearch') || ''
  const currentStatus = (searchParams?.get('streamStatus') as StreamStatus) || 'all'

  // Local state for form inputs
  const [search, setSearch] = useState(currentSearch)
  const [status, setStatus] = useState<StreamStatus>(currentStatus)

  // Sync local state with URL params when they change externally
  useEffect(() => {
    setSearch(currentSearch)
    setStatus(currentStatus)
  }, [currentSearch, currentStatus])

  // Check if any filters are active
  const hasActiveFilters = currentSearch !== '' || currentStatus !== 'all'

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Record<string, string>) => {
      const current = new URLSearchParams(
        searchParams ? Array.from(searchParams.entries()) : [],
      )

      // Update or remove each filter
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value.trim() !== '' && value !== 'all') {
          current.set(key, value)
        }
        else {
          current.delete(key)
        }
      })

      const queryString = current.toString()
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, {
        scroll: false,
      })
    },
    [pathname, router, searchParams],
  )

  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== currentSearch) {
        updateFilters({ streamSearch: search, streamStatus: status })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search, currentSearch, status, updateFilters])

  // Apply status filter
  const applyStatusFilter = (newStatus: StreamStatus) => {
    setStatus(newStatus)
    updateFilters({ streamSearch: search, streamStatus: newStatus })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearch('')
    setStatus('all')
    updateFilters({
      streamSearch: '',
      streamStatus: '',
    })
  }

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search streams by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
            data-testid="stream-search-input"
          />
        </div>

        {/* Status Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="stream-filter-button"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filter Streams</h4>
                <p className="text-sm text-muted-foreground">
                  Filter by stream status
                </p>
              </div>

              {/* Status Filter */}
              <div className="grid gap-2">
                <Label>Status</Label>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyStatusFilter('all')}
                    className="justify-start"
                    data-testid="status-filter-all"
                  >
                    All Streams
                  </Button>
                  <Button
                    variant={status === 'online' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyStatusFilter('online')}
                    className="justify-start"
                    data-testid="status-filter-online"
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    Online (Ready)
                  </Button>
                  <Button
                    variant={status === 'offline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyStatusFilter('offline')}
                    className="justify-start"
                    data-testid="status-filter-offline"
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-gray-400" />
                    Offline (Waiting)
                  </Button>
                </div>
              </div>

              {/* Clear Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                data-testid="clear-stream-filters-button"
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button (visible when filters are active) */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-1"
            data-testid="clear-all-stream-filters-button"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground" data-testid="stream-filter-status">
          Showing
          {' '}
          {filteredCount}
          {' '}
          of
          {' '}
          {totalCount}
          {' '}
          streams
          {currentSearch && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
              Search: &quot;
              {currentSearch}
              &quot;
            </span>
          )}
          {currentStatus !== 'all' && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
              Status:
              {' '}
              {currentStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
