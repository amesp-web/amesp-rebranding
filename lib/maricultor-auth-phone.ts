/**
 * Login de maricultor é por TELEFONE + senha (6 primeiros do CPF).
 * O Supabase Auth só aceita email+senha, então armazenamos o telefone
 * no campo email no formato: 5511999999999@maricultor.amesp
 */

const MARICULTOR_AUTH_SUFFIX = "@maricultor.amesp"

/**
 * Normaliza telefone para apenas dígitos.
 * Brasil: se tiver 10 ou 11 dígitos (DDD + número), adiciona 55 na frente.
 * Retorna string só com números (ex: 5511999999999).
 */
export function normalizePhoneToAuthDigits(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = String(phone).replace(/\D/g, "").trim()
  if (digits.length < 10) return null
  // Já tem código do país
  if (digits.length >= 12 && digits.startsWith("55")) return digits
  if (digits.length === 11 || digits.length === 10) return "55" + digits
  return digits.length >= 10 ? digits : null
}

/**
 * Converte telefone para o "email" usado no auth.users (login do maricultor).
 */
export function phoneToMaricultorAuthEmail(phone: string | null | undefined): string | null {
  const digits = normalizePhoneToAuthDigits(phone)
  return digits ? `${digits}${MARICULTOR_AUTH_SUFFIX}` : null
}

/**
 * Verifica se o valor é um email de login de maricultor (telefone disfarçado).
 */
export function isMaricultorAuthEmail(value: string): boolean {
  return typeof value === "string" && value.endsWith(MARICULTOR_AUTH_SUFFIX)
}

/**
 * Extrai os dígitos do telefone a partir do auth email do maricultor.
 */
export function maricultorAuthEmailToDigits(authEmail: string): string | null {
  if (!isMaricultorAuthEmail(authEmail)) return null
  const local = authEmail.slice(0, -MARICULTOR_AUTH_SUFFIX.length)
  return /^\d+$/.test(local) ? local : null
}

/**
 * Formata dígitos para exibição: (11) 99999-9999
 */
export function formatPhoneFromDigits(digits: string): string {
  const d = digits.replace(/\D/g, "")
  if (d.length === 11 && d.startsWith("55")) {
    return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`
  }
  if (d.length === 13 && d.startsWith("55")) {
    return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`
  }
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  return digits
}

/**
 * No login unificado: se o usuário digitou algo que parece telefone,
 * retorna o auth email do maricultor; senão retorna o valor (email de admin).
 */
export function loginIdentifierToAuthEmail(input: string): string {
  const trimmed = (input || "").trim()
  if (trimmed.includes("@")) return trimmed // admin/login por e-mail
  const digits = String(trimmed).replace(/\D/g, "")
  const looksLikePhone = digits.length >= 10 && digits.length <= 13 && /^\d+$/.test(digits)
  if (looksLikePhone) {
    const authEmail = phoneToMaricultorAuthEmail(trimmed)
    if (authEmail) return authEmail
  }
  return trimmed
}
