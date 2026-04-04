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
