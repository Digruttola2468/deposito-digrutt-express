import { z } from "zod";

export const schemaPostUser = z.object({
  first_name: z.string().nonempty(),
  last_name: z.string().nonempty(),
  email: z.string().email(),
});