'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ActivityPicker } from '@/components/ActivityPicker'
import { ColorExplorer } from '@/components/activities/ColorExplorer'
import { ShapeBuilder } from '@/components/activities/ShapeBuilder'
import { StoryTap } from '@/components/activities/StoryTap'
import { TapTheSound } from '@/components/activities/TapTheSound'
import { OppositeGame } from '@/components/activities/OppositeGame'
import { PatternBreaker } from '@/components/activities/PatternBreaker'
import { SortIt } from '@/components/activities/SortIt'
import { TeachDigit } from '@/components/activities/TeachDigit'
import { BuildPuzzle } from '@/components/activities/BuildPuzzle'
import { Celebration } from '@/components/Celebration'
import { DigitCharacter } from '@/components/digit/DigitCharacter'
import { DigitSpeech } from '@/components/digit/DigitSpeech'
import { ACTIVITIES } from '@/lib/activities'
import type { Activity } from '@/lib/types'

type Phase = 'pick' | 'greeting' | 'play' | 'celebrate'

interface ChildData {
  name: string
  color: string
  age: number
}

const CHILD_MAP: Record<string, ChildData> = {
  '00000000-0000-0000-0000-000000000010': { name: 'Santi', color: '#60A5FA', age: 3 },
  '00000000-0000-0000-0000-000000000020': { name: 'Emily', color: '#F9A8D4', age: 2 },
  'c874e153-b199-492e-92a1-25018de7d24c': { name: 'Kylie', color: '#4ADE80', age: 10 },
}

function logSession(childId: string, activity: Activity, engagement: number) {
  fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      child_id: childId,
      activity_id: activity.id,
      traits: activity.traits,
      engagement,
    }),
  }).catch(() => {
    // fire-and-forget: swallow errors silently
  })
}

export default function PlayPage() {
  const params = useParams<{ childId: string }>()
  const router = useRouter()
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [phase, setPhase] = useState<Phase>('pick')

  // Lock scrolling on play pages (full-screen games)
  useEffect(() => {
    document.body.classList.add('scroll-lock')
    return () => document.body.classList.remove('scroll-lock')
  }, [])

  const child = CHILD_MAP[params.childId]

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/60">
        Child not found
      </div>
    )
  }

  function handleSelectActivity(activity: Activity) {
    setSelectedActivity(activity)
    setPhase('greeting')
  }

  function handleLetsGo() {
    setPhase('play')
  }

  function handleActivityComplete(engagement: number) {
    if (selectedActivity) {
      logSession(params.childId, selectedActivity, engagement)
    }
    setPhase('celebrate')
  }

  function handlePlayMore() {
    setSelectedActivity(null)
    setPhase('pick')
  }

  if (phase === 'celebrate' && selectedActivity) {
    return (
      <Celebration
        childName={child.name}
        activityTitle={selectedActivity.title}
        childColor={child.color}
        onPlayMore={handlePlayMore}
      />
    )
  }

  if (phase === 'greeting' && selectedActivity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6">
        <DigitCharacter
          form={selectedActivity.digit_form}
          state="happy"
          color={child.color}
          size={180}
        />
        <DigitSpeech
          message={`Hi ${child.name}! Ready for ${selectedActivity.title}?`}
          isVisible={true}
        />
        <button
          onClick={handleLetsGo}
          className="mt-4 px-10 py-4 rounded-full text-xl font-bold text-white transition-transform active:scale-95"
          style={{ backgroundColor: child.color }}
        >
          Let&apos;s go!
        </button>
      </div>
    )
  }

  if (phase === 'play' && selectedActivity) {
    const activityComponents: Record<string, React.ReactNode> = {
      'color-explorer': (
        <ColorExplorer childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'shape-builder': (
        <ShapeBuilder childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'story-tap': (
        <StoryTap childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'tap-the-sound': (
        <TapTheSound childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'opposite-game': (
        <OppositeGame childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'pattern-breaker': (
        <PatternBreaker childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'sort-it': (
        <SortIt childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'teach-digit': (
        <TeachDigit childColor={child.color} onComplete={handleActivityComplete} />
      ),
      'build-puzzle': (
        <BuildPuzzle childColor={child.color} onComplete={handleActivityComplete} />
      ),
    }

    return (
      <div className="min-h-screen">
        {activityComponents[selectedActivity.id]}
      </div>
    )
  }

  return (
    <ActivityPicker
      childName={child.name}
      childColor={child.color}
      childAge={child.age}
      onSelect={handleSelectActivity}
    />
  )
}
