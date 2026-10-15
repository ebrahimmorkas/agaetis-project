import { isAxiosError } from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

/**
 * Copies field errors from an API response onto the form.
 * Returns true if anything was set, so the caller can skip the toast.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  conflictField?: Path<T>,
) {
  if (!isAxiosError(error) || !error.response) return false

  const { status, data } = error.response

  if (status === 409 && conflictField) {
    setError(conflictField, { message: data?.message })
    return true
  }

  const fieldErrors = data?.errors as Record<string, string[]> | undefined
  if (status === 400 && fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      setError(field as Path<T>, { message: messages[0] })
    }
    return Object.keys(fieldErrors).length > 0
  }

  return false
}
