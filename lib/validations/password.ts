import { z } from 'zod';

export const passwordCategories = [
  'bank',
  'email',
  'phone',
  'laptop',
  'investment',
  'google',
  'other',
] as const;

export const passwordSchema = z.object({
  category: z.enum(passwordCategories, {
    error: 'Please select a valid category',
  }),
  title: z.string().min(1, 'Title is required').max(200),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

export type PasswordInput = z.infer<typeof passwordSchema>;
export type PasswordCategory = typeof passwordCategories[number];
