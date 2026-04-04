import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StoryTap } from '@/components/activities/StoryTap'

describe('StoryTap', () => {
  it('renders story text with tap instruction', () => {
    const onComplete = vi.fn()
    render(<StoryTap childColor="#60A5FA" onComplete={onComplete} />)

    const tapElements = screen.getAllByText(/tap/i)
    expect(tapElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a tap button', () => {
    const onComplete = vi.fn()
    render(<StoryTap childColor="#60A5FA" onComplete={onComplete} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('does not call onComplete initially', () => {
    const onComplete = vi.fn()
    render(<StoryTap childColor="#60A5FA" onComplete={onComplete} />)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('displays progress dots', () => {
    const onComplete = vi.fn()
    const { container } = render(
      <StoryTap childColor="#60A5FA" onComplete={onComplete} />
    )

    const dots = container.querySelectorAll('[data-testid="progress-dot"]')
    expect(dots.length).toBe(5)
  })
})
