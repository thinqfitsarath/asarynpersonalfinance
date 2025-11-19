import { z } from 'zod';

export const relationshipTypes = [
  'spouse',
  'child',
  'parent',
  'sibling',
  'lawyer',
  'executor',
  'trusted_friend',
  'other',
] as const;

export const accessLevels = [
  'full',
  'view-only',
  'emergency-only',
] as const;

export const trustedContactSchema = z.object({
  contactName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  contactEmail: z.string().email('Invalid email address'),
  relationship: z.enum(relationshipTypes, {
    errorMap: () => ({ message: 'Please select a valid relationship' }),
  }),
  accessLevel: z.enum(accessLevels, {
    errorMap: () => ({ message: 'Please select a valid access level' }),
  }),
  delayDays: z
    .number()
    .int()
    .min(0, 'Delay must be at least 0 days')
    .max(365, 'Delay cannot exceed 365 days')
    .default(7),
});

export type TrustedContactInput = z.infer<typeof trustedContactSchema>;
export type RelationshipType = typeof relationshipTypes[number];
export type AccessLevel = typeof accessLevels[number];
