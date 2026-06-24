import { z } from 'zod';

export const FormShiftSchema = z.object({
  department_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),
  
  title: z.string().min(3).max(50),

  description: z.string().max(200).optional().or(z.literal('')),

  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  client_name: z.string().optional().or(z.literal('')),

  shift_date: z.date(),

  hourly_rate: z.coerce.number().min(1),

  start_time: z.date(),
  end_time: z.date(),

  image_url: z.string().url().optional().or(z.literal('')),

  required_workers: z.coerce.number().min(1).default(1),
})
// Validazione 1: Data e orario di inizio nel futuro
.refine((data) => {
  const startDateTime = new Date(data.shift_date);
  startDateTime.setHours(data.start_time.getHours(), data.start_time.getMinutes(), 0, 0);

  // Deve essere nel futuro (con una tolleranza di 1 minuto per il clock skew)
  return startDateTime.getTime() > Date.now() - 60000;
}, {
  message: "Start time cannot be in the past",
  path: ["start_time"],
})
// Validazione 2: Durata minima (1h) e massima (24h) e coerenza oraria
.refine((data) => {
  const start = new Date(data.shift_date);
  start.setHours(data.start_time.getHours(), data.start_time.getMinutes(), 0, 0);

  const end = new Date(data.shift_date);
  end.setHours(data.end_time.getHours(), data.end_time.getMinutes(), 0, 0);

  // Se l'end_time è <= start_time, assumiamo che finisca il giorno dopo
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return diffInHours >= 1 && diffInHours <= 24;
}, {
  message: "Shift duration must be between 1 and 24 hours",
  path: ["end_time"],
});

export type FormShift = z.infer<typeof FormShiftSchema>;