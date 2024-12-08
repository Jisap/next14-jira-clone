"use client"

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateTaskModal } from "../hooks/use-create-taks-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";

export const CreateTaskModal = () => {

  const { isOpen, setIsOpen, close } = useCreateTaskModal(); // Estado de isOpen, fn que lo modifica y fn que cierra el modal

  return (
    <ResponsiveModal
      open={isOpen}             // 
      onOpenChange={setIsOpen}  // Si se clickea se permite a ResponsiveModal cambiar el valor de isOpen
    >
      <CreateTaskFormWrapper onCancel={close} />
    </ResponsiveModal>
  )
}