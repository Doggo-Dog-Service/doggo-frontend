export const toFloat = (value) => {
    if(value === null || value === undefined || value === '') return null

    const number = parseFloat(value)
    return Number.isNaN(number) ? null : number
}