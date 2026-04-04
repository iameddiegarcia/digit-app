'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ActivityPicker } from '@/components/ActivityPicker'
import { ColorExplorer } from '@/components/activities/ColorExplorer'
import { ShapeBuilder } from '@/components/activities/ShapeBuilder'
import { StoryTap } from '@/components/activities/StoryTap'
import { Celebration } from '@/components/Celebration'
import type { Activity } from '@/lib/types'

interface ChildData {
  name: string
  color: string
}

const CHILD_MAP: Record<string, ChildData> = {
  '00000000-0000-0000-0000-000000000010': { name: 'Santi', color: '#60A5FA' },
  '00000000-0000-0000-0000-000000000020': { name: 'Emily', color: '#F9A8D4' },
}

export default function PlayPage() {
  const params = useParams<{ childId: string }>()
  const router = useRouter()
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const child = CHILD_MAP[params.childId]

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/60">
        Child not found
      </div>
    )
  }

  function handleActivityComplete(_engagement: number) {
    setShowCelebration(true)
  }

  function handlePlayMore() {
    setSelectedActivity(null)
    setShowCelebration(false)
  }

  if (showCelebration && selectedActivity) {
    return (
      <Celebration
        childName={child.name}
        activityTitle={selectedActivity.title}
        childColor={child.color}
        onPlayMore={handlePlayMore}
      />
    )
  }

  if (selectedActivity) {
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
      onSelect={setSelectedActivity}
    />
  )
}
