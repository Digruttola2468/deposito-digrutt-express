import { z } from "zod";

export const schemaPostMercaderiaEntrada = z.object({
  fecha: z.string(),
  stock: z.number().min(0),
  idcategoria: z.enum(["1", "2"]),
  idinventario: z.number().min(0),
  idremito: z.number().optional(),
  idFacturaNegro: z.number().optional(),
});

export const schemaPostMercaderiaSalida = z.object({
  fecha: z.string(),
  stock: z.number().min(0),
  idinventario: z.number().min(0),
  observacion: z.string(),
});

export const schemaPostListMercaderia = z.object({
  fecha: z.string(),
  data: z
    .object({ stock: z.number().min(0), idinventario: z.number().min(0) })
    .array()
    .nonempty(),
});

export const schemaPutMercaderia = z.object({
  fecha: z.string().optional(),
  stock: z.number().min(0).optional(),
  idcategoria: z.enum(["1", "2"]).optional(),
  idinventario: z.number().min(0).optional(),
  idremito: z.number().optional(),
  idFacturaNegro: z.number().optional(),
  observacion: z.string().optional(),
});
