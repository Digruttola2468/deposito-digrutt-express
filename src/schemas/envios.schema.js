import { z } from "zod";

export const schemaPostEnvios = z.object({
  idVehiculo: z.number(),
  ubicacion: z.string(),
  descripcion: z.string().optional().nullable(),
  idLocalidad: z.number(),
  lat: z.string(),
  lon: z.string(),
});

export const schemaPutEnvios = z.object({
  idVehiculo: z.number().optional(),
  ubicacion: z.string().optional(),
  descripcion: z.string().optional(),
  fechaDate: z.string().optional(),
  fechaObj: z.string().optional(),
  horaObj: z.string().optional(),
  idLocalidad: z.number().optional(),
  lat: z.string().optional().nullable(),
  lon: z.string().optional().nullable(),
});
