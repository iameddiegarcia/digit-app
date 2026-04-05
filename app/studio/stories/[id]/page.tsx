'use client'

import { StoryBuilder } from '@/components/studio/StoryBuilder'
import { useParams } from 'next/navigation'

export default function StoryEditorPage() {
  const params = useParams()
  const id = params.id as string

  return <StoryBuilder creationId={id === 'new' ? null : id} />
}
