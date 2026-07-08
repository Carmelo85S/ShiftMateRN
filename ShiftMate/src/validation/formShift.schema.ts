import { z } from 'zod';
export const FormShiftSchema = z.object({
  department_id: z.string().uuid().nullable().optional().or(z.literal('')),
  
  title: z.string().min(3).max(50),
  
  // Rendiamoli esplicitamente nullable e opzionali
  description: z.string().max(200).nullable().optional().or(z.literal('')),
  address: z.string().nullable().optional().or(z.literal('')),
  city: z.string().nullable().optional().or(z.literal('')),
  client_name: z.string().nullable().optional().or(z.literal('')),

  shift_date: z.date(),
  hourly_rate: z.coerce.number().min(1),
  start_time: z.date(),
  end_time: z.date(),

  image_url: z.string().url().nullable().optional().or(z.literal('')),
  required_workers: z.coerce.number().min(1).default(1),
})
// Aggiungi una trasformazione globale per pulire le stringhe vuote in null
.transform((data) => ({
  ...data,
  description: data.description === '' ? null : data.description,
  address: data.address === '' ? null : data.address,
  city: data.city === '' ? null : data.city,
  client_name: data.client_name === '' ? null : data.client_name,
  department_id: data.department_id === '' ? null : data.department_id,
  image_url: data.image_url === '' ? null : data.image_url,
}));

export type FormShift = z.infer<typeof FormShiftSchema>;