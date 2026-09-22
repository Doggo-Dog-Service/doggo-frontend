export const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return 'R$ 0,00'

  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}