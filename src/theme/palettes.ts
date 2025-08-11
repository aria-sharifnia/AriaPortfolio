export type PaletteKey = 'aqua' | 'emerald' | 'sky'
export const DEFAULT_PALETTE: PaletteKey = 'sky'

export function colorsFor(key: PaletteKey | string) {
  switch (key) {
    case 'aqua':
      return {
        shell: 'radial-gradient(120% 120% at 30% 25%, #143A5F 0%, #0B2945 65%)',
        liquid: 'linear-gradient(180deg, #22D3EE 0%, #14B8A6 100%)',
        shadow: '0 10px 25px rgba(34,211,238,.32)',
        textLight: '#EAFBFF',
      }
    case 'emerald':
      return {
        shell: 'radial-gradient(120% 120% at 30% 25%, #12324F 0%, #0A2340 65%)',
        liquid: 'linear-gradient(180deg, #34D399 0%, #16A34A 100%)',
        shadow: '0 10px 25px rgba(16,185,129,.30)',
        textLight: '#ECFFF6',
      }
    default:
      return {
        shell: 'radial-gradient(120% 120% at 30% 25%, #123F6B 0%, #0B2945 65%)',
        liquid: 'linear-gradient(180deg, #60A5FA 0%, #22D3EE 100%)',
        shadow: '0 10px 25px rgba(59,130,246,.30)',
        textLight: '#EEF4FF',
      }
  }
}
