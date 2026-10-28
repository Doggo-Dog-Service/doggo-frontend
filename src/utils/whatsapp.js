export function whatsappLink(phone, text) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length < 10) return null
  const number = digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${number}?text=${encodeURIComponent(text ?? '')}`
}
