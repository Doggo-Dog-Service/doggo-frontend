const FIELD_TRANSLATIONS = {
  email: 'Email',
  password: 'Senha',
  full_name: 'Nome completo',
  cpf: 'CPF',
  phone: 'Telefone',
  password_confirm: 'Confirmação de senha',
  new_password: 'Nova senha',
  re_new_password: 'Confirmação da nova senha',
  username: 'Usuário',
  first_name: 'Nome',
  last_name: 'Sobrenome',
  profile_picture: 'Foto de perfil',
  non_field_errors: '',
}

const ERROR_TRANSLATIONS = {
  'Unable to log in with provided credentials.': 'Email ou senha incorretos.',
  'No active account found with the given credentials': 'Nenhuma conta encontrada com esses dados.',
  'This field is required.': 'Este campo é obrigatório.',
  'This field may not be blank.': 'Este campo não pode estar em branco.',
  'This field may not be null.': 'Este campo não pode ser nulo.',
  'Enter a valid email address.': 'Informe um email válido.',
  'Enter a valid value.': 'Informe um valor válido.',
  'A valid integer is required.': 'Informe um número inteiro válido.',
  'A valid number is required.': 'Informe um número válido.',
  'This password is too common.': 'Esta senha é muito comum.',
  'This password is too short.': 'Esta senha é muito curta.',
  'This password is entirely numeric.': 'Esta senha é totalmente numérica.',
  "The two password fields didn't match.": 'As senhas não coincidem.',
  'User with this Email already exists.': 'Já existe um usuário com este email.',
  'User with this email already exists.': 'Já existe um usuário com este email.',
  'A user with that email already exists.': 'Já existe um usuário com este email.',
  'Given token not valid for any token type': 'Token inválido ou expirado.',
  'Token is invalid or expired': 'Token inválido ou expirado.',
  'Token is invalid': 'Token inválido.',
  'User account is disabled.': 'Conta de usuário desativada.',
  'Incorrect authentication credentials.': 'Credenciais de autenticação incorretas.',
  'Authentication credentials were not provided.': 'Credenciais de autenticação não fornecidas.',
  'Not found.': 'Não encontrado.',
  'Method not allowed.': 'Método não permitido.',
  'Internal server error.': 'Erro interno do servidor.',
}

function translateError(message) {
  if (!message) return ''
  const trimmed = message.trim()
  if (ERROR_TRANSLATIONS[trimmed]) return ERROR_TRANSLATIONS[trimmed]
  const withDot = trimmed.endsWith('.') ? trimmed : trimmed + '.'
  if (ERROR_TRANSLATIONS[withDot]) return ERROR_TRANSLATIONS[withDot]
  return trimmed
}

function getFieldLabel(field) {
  return FIELD_TRANSLATIONS[field] || field
}

function flattenErrors(obj) {
  const messages = []
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'non_field_errors') {
      if (Array.isArray(value)) {
        value.forEach(msg => messages.push(translateError(msg)))
      }
    } else if (Array.isArray(value)) {
      const label = getFieldLabel(key)
      value.forEach(msg => {
        const translated = translateError(msg)
        messages.push(label ? `${label}: ${translated}` : translated)
      })
    } else if (typeof value === 'object' && value !== null) {
      const nested = flattenErrors(value)
      messages.push(...nested)
    } else if (typeof value === 'string') {
      const label = getFieldLabel(key)
      const translated = translateError(value)
      messages.push(label ? `${label}: ${translated}` : translated)
    }
  }
  return messages
}

export function parseDjangoErrors(error) {
  if (!error) return 'Erro desconhecido.'
  if (typeof error === 'string') return error

  const response = error.response?.data
  const status = error.response?.status

  if (!response) {
    if (error.code === 'ERR_NETWORK') return 'Erro de conexão com o servidor. Verifique sua internet.'
    if (error.code === 'ERR_CANCELED') return 'Requisição cancelada.'
    if (error.message) return error.message
    return 'Erro de conexão com o servidor.'
  }

  if (typeof response === 'string') return response

  if (response.detail) return translateError(response.detail)

  const messages = flattenErrors(response)
  if (messages.length > 0) return messages.join(' ')

  if (status) return `Erro do servidor (${status}).`
  return 'Erro desconhecido.'
}
