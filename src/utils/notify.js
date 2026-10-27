import { toast } from 'vue3-toastify'

const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
  promise: (promise, messages) => toast.promise(promise, messages),
}

export default notify
