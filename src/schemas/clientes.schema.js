import { z } from "zod";

export const schemaPostCliente = z.object({
  cliente: z.string(),
  domicilio: z.string().optional(),
  idLocalidad: z.number().min(0).optional(),
  mail: z.string().email().optional(),
  cuit: z.string().optional(),
});

export const schemaPutCliente = z.object({
  cliente: z.string().optional(),
  domicilio: z.string().optional(),
  idLocalidad: z.number().min(0).optional(),
  mail: z.string().email().optional(),
  cuit: z.string().optional(),
});
