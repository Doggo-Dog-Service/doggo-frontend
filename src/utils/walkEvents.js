import { Camera, Droplet, GlassWater, Leaf } from 'lucide-vue-next'

// Fonte única dos marcadores do passeio: rótulo, ícone, token de cor e inicial (pino do mapa).
export const WALK_EVENT_KINDS = {
  pee: { label: 'Xixi', icon: Droplet, color: '--warning', initial: 'X' },
  poop: { label: 'Cocô', icon: Leaf, color: '--success', initial: 'C' },
  water: { label: 'Água', icon: GlassWater, color: '--info', initial: 'A' },
  photo: { label: 'Foto', icon: Camera, color: '--primary', initial: 'F' },
}

export function walkEventMeta(kind) {
  return WALK_EVENT_KINDS[kind] ?? { label: kind, icon: Droplet, color: '--primary', initial: '?' }
}

// Elemento DOM do pino no mapa (o maplibre exige um HTMLElement).
export function createWalkEventPin(kind) {
  const meta = walkEventMeta(kind)
  const el = document.createElement('div')

  el.textContent = meta.initial
  el.title = meta.label
  el.setAttribute('role', 'img')
  el.setAttribute('aria-label', meta.label)
  el.style.cssText = `width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:700 13px sans-serif;color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgb(0 0 0 / .35);background:var(${meta.color}, #2E7D6B)`

  return el
}
