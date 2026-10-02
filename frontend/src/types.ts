// Types that mirror the backend API contract (see README).

export type ApplicationStatus = 'WISHLIST' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED'

/** Statuses a new application can start in. */
export type InitialStatus = Extract<ApplicationStatus, 'WISHLIST' | 'APPLIED'>

export type WorkMode = 'ONSITE' | 'HYBRID' | 'REMOTE'

export interface Application {
  id: number
  company: string
  position: string
  location: string | null
  workMode: WorkMode
  source: string | null
  jobUrl: string | null
  salaryMinK: number | null
  salaryMaxK: number | null
  status: ApplicationStatus
  /** ISO date, e.g. "2026-09-20". */
  appliedAt: string | null
  /** ISO local date-time, e.g. "2026-09-18T10:00:00". */
  createdAt: string
  updatedAt: string
  notes: string | null
  daysSinceUpdate: number
  followUpDue: boolean
}

export interface StatusChange {
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  changedAt: string
}

export interface ApplicationDetail extends Application {
  /** Oldest first. */
  history: StatusChange[]
}

/** Body for PUT /api/applications/{id}. */
export interface ApplicationPayload {
  company: string
  position: string
  location: string | null
  workMode: WorkMode
  source: string | null
  jobUrl: string | null
  salaryMinK: number | null
  salaryMaxK: number | null
  appliedAt: string | null
  notes: string | null
}

/** Body for POST /api/applications. */
export interface CreateApplicationPayload extends ApplicationPayload {
  status: InitialStatus
}

export interface WeeklyCount {
  /** ISO date of the Monday that starts the week. */
  weekStart: string
  count: number
}

export interface Stats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  active: number
  /** Between 0 and 1, or null when there is nothing to compute it from. */
  interviewRate: number | null
  followUpDue: number
  /** Last 8 weeks, oldest first. */
  weekly: WeeklyCount[]
}
