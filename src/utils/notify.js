import { toast } from 'vue3-toastify'

const FALLBACKS = {
  success: 'Operação concluída.',
  error: 'Ocorreu um erro. Tente novamente.',
  info: 'Atenção.',
}

function toText(value, fallback) {
  const text = typeof value === 'string' ? value : value?.message
  return typeof text === 'string' && text.trim() ? text : fallback
}

const notify = {
  success: (message) => toast.success(toText(message, FALLBACKS.success)),
  error: (message) => toast.error(toText(message, FALLBACKS.error)),
  info: (message) => toast.info(toText(message, FALLBACKS.info)),
  promise: (promise, messages) => toast.promise(promise, messages),
}

export default notify
