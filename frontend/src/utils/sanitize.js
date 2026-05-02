import DOMPurify from 'dompurify'

export function sanitizeText(value) {
  return DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  })
}
