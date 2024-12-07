"use client"

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useEditTaskModal } from "../hooks/use-edit-taks-modal";
import { EditTaskFormWrapper } from "./edit-task-form-wrapper";

export const EditTaskModal = () => {

  const { taskId, close } = useEditTaskModal(); // Estado de taskId establecido en la url y close que lo elimina

  return (
    <ResponsiveModal
      open={!!taskId} // parámetro convertido a booleano
      onOpenChange={close}
    >
      {taskId && (
        <EditTaskFormWrapper 
          onCancel={close} 
          id={taskId} 
        />
      )}
    </ResponsiveModal>
  )
}