'use client'

import { Calendar, Filter, Search, X } from 'lucide-react'
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

interface RecordingFiltersProps {
  totalCount: number
  filteredCount: number
}

export function RecordingFilters({
  totalCount,
  filteredCount,
}: RecordingFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentSearch = searchParams?.get('search') || ''
  const currentDateFrom = searchParams?.get('dateFrom') || ''
  const currentDateTo = searchParams?.get('dateTo') || ''
  const currentFileSizeMin = searchParams?.get('fileSizeMin') || ''
  const currentFileSizeMax = searchParams?.get('fileSizeMax') || ''

  // Local state for form inputs
  const [search, setSearch] = useState(currentSearch)
  const [dateFrom, setDateFrom] = useState(currentDateFrom)
  const [dateTo, setDateTo] = useState(currentDateTo)
  const [fileSizeMin, setFileSizeMin] = useState(currentFileSizeMin)
  const [fileSizeMax, setFileSizeMax] = useState(currentFileSizeMax)

  // Check if any filters are active
  const hasActiveFilters
    = currentSearch !== ''
      || currentDateFrom !== ''
      || currentDateTo !== ''
      || currentFileSizeMin !== ''
      || currentFileSizeMax !== ''

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Record<string, string>) => {
      const current = new URLSearchParams(
        searchParams ? Array.from(searchParams.entries()) : [],
      )

      // Reset to page 1 when filters change
      current.set('page', '1')

      // Update or remove each filter
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
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
        updateFilters({ search })
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search, currentSearch, updateFilters])

  // Apply date and size filters
  const applyAdvancedFilters = () => {
    updateFilters({
      search,
      dateFrom,
      dateTo,
      fileSizeMin,
      fileSizeMax,
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setFileSizeMin('')
    setFileSizeMax('')
    updateFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      fileSizeMin: '',
      fileSizeMax: '',
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
            placeholder="Search recordings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>

        {/* Advanced Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="filter-button"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filter Recordings</h4>
                <p className="text-sm text-muted-foreground">
                  Filter by date range and file size
                </p>
              </div>

              {/* Date Range */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      From
                    </Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="h-9"
                      data-testid="date-from-input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="h-9"
                      data-testid="date-to-input"
                    />
                  </div>
                </div>
              </div>

              {/* File Size Range */}
              <div className="grid gap-2">
                <Label>File Size (MB)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={fileSizeMin}
                      onChange={e => setFileSizeMin(e.target.value)}
                      className="h-9"
                      min="0"
                      step="0.1"
                      data-testid="file-size-min-input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={fileSizeMax}
                      onChange={e => setFileSizeMax(e.target.value)}
                      className="h-9"
                      min="0"
                      step="0.1"
                      data-testid="file-size-max-input"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex-1"
                  data-testid="clear-filters-button"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={applyAdvancedFilters}
                  className="flex-1"
                  data-testid="apply-filters-button"
                >
                  Apply
                </Button>
              </div>
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
            data-testid="clear-all-filters-button"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground" data-testid="filter-status">
          Showing
          {' '}
          {filteredCount}
          {' '}
          of
          {' '}
          {totalCount}
          {' '}
          recordings
          {currentSearch && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
              Search: &quot;
              {currentSearch}
              &quot;
            </span>
          )}
          {(currentDateFrom || currentDateTo) && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
              Date:
              {' '}
              {currentDateFrom || '...'}
              {' '}
              -
              {' '}
              {currentDateTo || '...'}
            </span>
          )}
          {(currentFileSizeMin || currentFileSizeMax) && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
              Size:
              {' '}
              {currentFileSizeMin || '0'}
              MB -
              {' '}
              {currentFileSizeMax || '∞'}
              MB
            </span>
          )}
        </div>
      )}
    </div>
  )
}
