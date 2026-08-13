const SIZES = {
    'p': 'Pequeno',
    'm': 'Médio',
    'g': 'Grande',
}

export function petSizeConverter(size) {
    if (!['p', 'm', 'g'].includes(size)) return

    return SIZES[size]
}