export type Trait =
  | 'understanding'
  | 'organizing'
  | 'problem_solving'
  | 'responsibility'
  | 'real_world'
  | 'adaptability'

export type DigitForm =
  | 'round_bot'
  | 'froggy_designer'
  | 'light_pink_kitty'
  | 'explorer'
  | 'artist'
  | 'builder'
  | 'story'
  | 'music'
  | 'scientist'
  | 'active'
  | 'sleepy'

export type DigitState =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'celebrating'
  | 'transitioning'
  | 'listening'
  | 'sleepy'

export interface DigitConfig {
  base_form: DigitForm
  color: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  nickname: string
  birth_date: string
  digit_config: DigitConfig
}

export interface Session {
  id: string
  child_id: string
  platform: 'ipad' | 'creator_studio' | 'alexa' | 'loona'
  started_at: string
  ended_at: string | null
  summary: string | null
}

export interface Activity {
  id: string
  title: string
  description: string
  type: 'built_in' | 'kylie_created'
  target_age_min: number
  target_age_max: number
  traits: Trait[]
  digit_form: DigitForm
}

export interface TraitScore {
  id: string
  child_id: string
  trait: Trait
  score: number
  updated_at: string
}

// Trait Intelligence Engine types
export interface ChildTraitProfile {
  id: string
  child_id: string
  trait: Trait
  current_level: number
  confidence: number
  trend: 'improving' | 'stable' | 'declining'
  last_evidence_at: string | null
}

export interface ActivityAttempt {
  id: string
  session_id: string
  child_id: string
  activity_id: string
  primary_trait: Trait
  level_target: number
  attempts: number
  hints: number
  completion_time_seconds: number | null
  accuracy: number | null
  independence: number | null
  persistence: number | null
  flexibility: number | null
  abandoned: boolean
  completed_at: string
}

// Auth types
export type FamilyRole = 'parent' | 'creator' | 'child'

export interface UserProfile {
  id: string
  family_id: string
  child_id: string | null
  display_name: string
  role: FamilyRole
}

// Creation types (Kylie's Studio)
export type CreationStatus = 'draft' | 'review' | 'published'
export type CreationType = 'story' | 'puzzle' | 'activity'

export interface Creation {
  id: string
  family_id: string
  creator_id: string
  title: string
  type: CreationType
  content: StoryDocument | Record<string, unknown>
  primary_trait: Trait | null
  target_age_min: number
  target_age_max: number
  status: CreationStatus
  created_at: string
  updated_at: string
}

// Story document schema
export interface StoryDocument {
  version: 1
  nodes: StoryNode[]
  startNodeId: string
}

export interface StoryNode {
  id: string
  text: string
  emoji: string
  choices: StoryChoice[]
  isEnding: boolean
}

export interface StoryChoice {
  label: string
  nextNodeId: string
}

// Dashboard types
export interface TraitSnapshot {
  trait: Trait
  current_level: number
  confidence: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface SessionSummary {
  id: string
  child_id: string
  child_name: string
  started_at: string
  ended_at: string | null
  platform: string
  activities_completed: number
}

export interface ParentObservation {
  id: string
  child_id: string
  trait: Trait | null
  notes: string
  verified: boolean
  created_at: string
}

// Activity Finder types (L3)
export interface LocalActivity {
  id: string
  family_id: string
  title: string
  description: string | null
  url: string | null
  url_hash: string | null
  source: string | null
  location: string | null
  cost: 'free' | 'low' | 'paid' | null
  cost_amount: number | null
  age_min: number | null
  age_max: number | null
  primary_trait: Trait | null
  traits: Trait[]
  tags: string[]
  event_date: string | null
  event_end_date: string | null
  status: 'new' | 'pinned' | 'dismissed' | 'archived'
  discovered_at: string
  classified_at: string | null
  raw_snippet: string | null
}

export interface DiscoveryJob {
  id: string
  family_id: string
  status: 'running' | 'completed' | 'failed'
  queries_total: number
  queries_completed: number
  activities_found: number
  started_at: string
  completed_at: string | null
  error: string | null
}

export interface WeeklyGoal {
  id: string
  family_id: string
  child_id: string
  week_start: string
  theme: string | null
  goals: GoalItem[]
}

export interface GoalItem {
  text: string
  trait: Trait | null
  completed: boolean
}
