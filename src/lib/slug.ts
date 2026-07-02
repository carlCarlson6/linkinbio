import z from 'zod'

// Lowercase letters, digits and hyphens; no leading/trailing hyphen; 3-30 chars.
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Handle must be at least 3 characters')
  .max(30, 'Handle must be at most 30 characters')
  .regex(SLUG_REGEX, 'Only lowercase letters, numbers and hyphens (no leading/trailing hyphen)')
