import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { TaskStatus } from "../types";



export const useTaksFilters = () => {

  return useQueryStates({                                  // Recibe un objeto donde cada clave es el nombre de un parámetro de consulta. Cada valor es una función que define cómo procesar (parsear) ese parámetro
    projectId: parseAsString,                              // Se espera que sea una cadena de texto 
    status: parseAsStringEnum(Object.values(TaskStatus)),  // Se valida contra los valores del enumerador TaskStatus.
    search: parseAsString,                                 // Se espera que sea una cadena de texto
    assigneeId: parseAsString,                             // Se espera que sea una cadena de texto
    dueDate: parseAsString,                                // Se espera que sea una cadena de texto
  })
}

// useTraksFilters establece un state para cada parámetro de consulta y lo refleja en la url 