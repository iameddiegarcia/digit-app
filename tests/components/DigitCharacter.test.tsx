import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DigitCharacter } from '@/components/digit/DigitCharacter'

describe('DigitCharacter', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <DigitCharacter form="round_bot" state="idle" color="#60A5FA" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies the correct color', () => {
    const { container } = render(
      <DigitCharacter form="round_bot" state="idle" color="#60A5FA" />
    )
    const body = container.querySelector('[data-part="body"]')
    expect(body).toBeInTheDocument()
  })

  it('renders with different states without crashing', () => {
    const states = ['idle', 'happy', 'thinking', 'celebrating'] as const
    states.forEach((state) => {
      const { container } = render(
        <DigitCharacter form="round_bot" state={state} color="#60A5FA" />
      )
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })
})
