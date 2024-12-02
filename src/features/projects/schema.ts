import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z.union([                                                       // Este método permite que el valor de imageUrl sea de uno de dos tipos:
    z.instanceof(File),                                                  // Un objeto File
    z.string().transform((value) => value === "" ? undefined : value),   // Una cadena (string), que puede ser transformada bajo ciertas condiciones.
  ])                                                                     // Si la cadena es vacía (""), se transforma en undefined. Si no está vacía, se deja el valor tal cual.
  .optional(),
  workspaceId: z.string()

});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Minimum 1 character required").optional(),
  image: z.union([                                                       // Este método permite que el valor de imageUrl sea de uno de dos tipos:
    z.instanceof(File),                                                  // Un objeto File
    z.string().transform((value) => value === "" ? undefined : value),   // Una cadena (string), que puede ser transformada bajo ciertas condiciones.
  ])                                                                     // Si la cadena es vacía (""), se transforma en undefined. Si no está vacía, se deja el valor tal cual.
    .optional(),
  

});