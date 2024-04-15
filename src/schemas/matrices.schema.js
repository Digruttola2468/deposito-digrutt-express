import { z } from "zod";

export const schemaPostMatriz = z.object({
  descripcion: z.string().min(3),
  idmaterial: z.number().optional().nullable(),
  idcliente: z.number(),
  cantPiezaGolpe: z.number(),
  ubicacion: z.string().optional().nullable(),
  numero_matriz: z.number(),
});

export const schemaPutMatriz = z.object({
  descripcion: z.string().min(3).optional().nullable(),
  idmaterial: z.number().optional().nullable(),
  cantPiezaGolpe: z.number().optional().nullable(),
  ubicacion: z.string().optional().nullable(),
});