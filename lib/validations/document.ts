import { z } from 'zod';

export const documentCategories = [
  'investment',
  'insurance',
  'house',
  'other',
] as const;

export const documentTypes = [
  'policy',
  'deed',
  'certificate',
  'statement',
  'contract',
  'other',
] as const;

export const documentSchema = z.object({
  category: z.enum(documentCategories, {
    error: 'Please select a valid category',
  }),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  documentType: z.enum(documentTypes).optional(),
  provider: z.string().max(200).optional(),
  policyNumber: z.string().max(100).optional(),
  amount: z.number().positive().optional(),
  premium: z.number().positive().optional(),
  maturityDate: z.date().optional(),
});

export type DocumentInput = z.infer<typeof documentSchema>;
export type DocumentCategory = typeof documentCategories[number];
export type DocumentType = typeof documentTypes[number];
