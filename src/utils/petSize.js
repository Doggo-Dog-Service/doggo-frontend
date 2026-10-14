const SIZES = {
  p: 'Pequeno',
  m: 'Médio',
  g: 'Grande',
}

export const PET_SIZE_OPTIONS = [
  { title: 'Pequeno', value: 'p' },
  { title: 'Médio', value: 'm' },
  { title: 'Grande', value: 'g' },
]

export function petSizeConverter(size) {
  if (!['p', 'm', 'g'].includes(size)) return

  return SIZES[size]
}
