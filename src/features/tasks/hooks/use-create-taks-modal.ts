

import { useQueryState, parseAsBoolean } from "nuqs";

export const useCreateTaskModal = () => { // Estado que modifica el estado de isOpen y maneja el parámetro de la URL.
  const [ isOpen, setIsOpen ] = useQueryState( 
    "create-task",                              // El nombre del parámetro en la URL
    parseAsBoolean                                 // Define cómo interpretar el valor del parámetro y qué hacer con los valores predeterminados.
      .withDefault(false)                          // Si createProjectModalOpen no está o tiene un valor predeterminado, isOpen será false. 
      .withOptions({ clearOnDefault: true })       // Si createProjectModalOpen=true está en la URL, isOpen será true.
  );

  // Estas funciones actualizan el estado (isOpen) y, por extensión, el parámetro en la URL:
  const open = () => setIsOpen(true);              // Llamar a open añade createProjectModalOpen=true a la URL.
  const close = () => setIsOpen(false);            // Llamar a close elimina createProjectModalOpen=true a la URL. de la URL (porque false es el valor predeterminado).

  return {
    isOpen, // El hook retorna el valor de isOpen, lo que permite que otros componentes puedan verificar si el modal está abierto o cerrado.
    setIsOpen,
    open,
    close,
  }
}