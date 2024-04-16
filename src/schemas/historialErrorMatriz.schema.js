import { z } from "zod";

export const schemaPostHistorialErrorMatriz = z.object({
  idMatriz: z.number().min(0),
  descripcion_deterioro: z.string(),
  stringDate: z.string().optional().nullable(),
  idCategoria: z.enum(["4", "3"]),
});

export const schemaPutHistorialErrorMatriz = z.object({
  idMatriz: z.number().min(0).optional().nullable(),
  descripcion_deterioro: z.string().optional().nullable(),
  stringDate: z.string().optional().nullable(),
  idCategoria: z.enum(["4", "3"]).optional().nullable(),
});
