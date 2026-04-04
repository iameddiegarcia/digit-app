import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ColorExplorer } from '@/components/activities/ColorExplorer'

describe('ColorExplorer', () => {
  it('renders color option buttons', () => {
    const onComplete = vi.fn()
    render(<ColorExplorer childColor="#60A5FA" onComplete={onComplete} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('does not call onComplete initially', () => {
    const onComplete = vi.fn()
    render(<ColorExplorer childColor="#60A5FA" onComplete={onComplete} />)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('displays progress dots', () => {
    const onComplete = vi.fn()
    const { container } = render(
      <ColorExplorer childColor="#60A5FA" onComplete={onComplete} />
    )

    const dots = container.querySelectorAll('[data-testid="progress-dot"]')
    expect(dots.length).toBe(4)
  })
})
