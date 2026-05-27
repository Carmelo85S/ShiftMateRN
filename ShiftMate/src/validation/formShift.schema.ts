import { z } from 'zod';

export const FormShiftSchema = z.object({
  // 🌟 Modificato: Accetta una stringa normale (così passa "staffing_agency_global") o un UUID
  department: z.string().min(1, { message: "Please select a valid department" }),
  
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters"),
    
  description: z.string()
    .max(200, "Description must be at most 200 characters")
    .optional()
    .or(z.literal('')),

    address: z.string().min(3, "Address is required for staffing").optional().or(z.literal('')),
    city: z.string().min(2, "City is required for staffing").optional().or(z.literal('')),
    client_name: z.string().min(2, "Client name must be at least 2 characters").optional().or(z.literal('')),
  
  shift_date: z.date({ 
    message: "Please select a valid date" 
  }).refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      return targetDate >= today;
    }, 
    "Shift date cannot be in the past"
  ),

  hourly_rate: z.coerce.number({ message: "Hourly rate must be a positive number" })
    .min(1, "Rate is too low"),

  start_time: z.date({ message: "Select start time" }),
  end_time: z.date({ message: "Select end time" }),
  
  image_url: z.string().url("Invalid URL").optional().or(z.literal('')),

  // 🌟 Aggiunto: Gestisce il numero di lavoratori richiesti per lo staffing (default a 1)
  required_workers: z.number().min(1, "At least 1 worker is required").default(1).optional(),
})
.refine((data) => {
  if (!data.start_time || !data.end_time) return true;
  return data.end_time.getTime() > data.start_time.getTime();
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

export type FormShift = z.infer<typeof FormShiftSchema>;