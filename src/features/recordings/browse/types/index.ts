export interface StreamRecording {
  name: string
  createdAt: Date
  base64: string | null
  fileSize: number
}

export interface RecordingFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  fileSizeMin?: number
  fileSizeMax?: number
}

export interface GetRecordingsResult {
  recordings: StreamRecording[]
  totalCount: number
  filteredCount: number
}
