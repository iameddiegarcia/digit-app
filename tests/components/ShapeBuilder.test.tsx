import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShapeBuilder } from '@/components/activities/ShapeBuilder'

describe('ShapeBuilder', () => {
  it('renders shape buttons in the palette', () => {
    const onComplete = vi.fn()
    render(<ShapeBuilder childColor="#60A5FA" onComplete={onComplete} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('does not call onComplete initially', () => {
    const onComplete = vi.fn()
    render(<ShapeBuilder childColor="#60A5FA" onComplete={onComplete} />)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('renders target area with ghost shapes', () => {
    const onComplete = vi.fn()
    const { container } = render(
      <ShapeBuilder childColor="#60A5FA" onComplete={onComplete} />
    )

    const ghosts = container.querySelectorAll('[data-testid="ghost-shape"]')
    expect(ghosts.length).toBeGreaterThanOrEqual(3)
  })
})
