

import { useQueryState, parseAsString } from "nuqs";

export const useEditTaskModal = () => { // Estado que modifica el estado de taskId y maneja el parámetro de la URL.
  const [ taskId, setTaskid ] = useQueryState( 
    "edit-task",                                   // El nombre del parámetro en la URL 
    parseAsString,                                 // El parseAs se usa para convertir el valor de la URL a un string
  );

  // Estas funciones actualizan el estado (taskId) y, por extensión, el parámetro en la URL:
  const open = (id:string) => setTaskid(id);      // Llamar a open añade edit-task=id a la URL.  
  const close = () => setTaskid(null);            // Llamar a close elimina edit-task=id a la URL.

  return {
    taskId, // El hook retorna el valor de taskId, lo que permite que otros componentes puedan verificar si el modal está abierto o cerrado.
    setTaskid,
    open,
    close,
  }
}