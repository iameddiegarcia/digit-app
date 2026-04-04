export interface DigitParts {
  viewBox: string
  body: (color: string) => string
  eyes: string
  mouth: Record<string, string>
  extras: (color: string) => string
}

export const ROUND_BOT: DigitParts = {
  viewBox: '0 0 140 140',
  body: (color: string) => `
    <circle cx="70" cy="72" r="44" fill="${color}" data-part="body" />
  `,
  eyes: `
    <circle cx="54" cy="63" r="12" fill="white" />
    <circle cx="86" cy="63" r="12" fill="white" />
    <circle cx="56" cy="64" r="7" fill="#0f172a" />
    <circle cx="88" cy="64" r="7" fill="#0f172a" />
    <circle cx="58" cy="61" r="3" fill="white" />
    <circle cx="90" cy="61" r="3" fill="white" />
  `,
  mouth: {
    idle: `<path d="M 55 85 Q 70 97 85 85" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round" />`,
    happy: `<path d="M 50 83 Q 70 100 90 83" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" />`,
    thinking: `<ellipse cx="70" cy="88" rx="6" ry="5" fill="#0f172a" />`,
    celebrating: `<path d="M 48 82 Q 70 102 92 82" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" />`,
  },
  extras: (color: string) => {
    const darkerColor = darken(color)
    return `
      <line x1="70" y1="32" x2="70" y2="14" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
      <circle cx="70" cy="10" r="6" fill="#FFD700" data-part="antenna-orb" />
      <ellipse cx="52" cy="114" rx="12" ry="6" fill="${darkerColor}" />
      <ellipse cx="88" cy="114" rx="12" ry="6" fill="${darkerColor}" />
    `
  },
}

function darken(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const factor = 0.7
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`
}
