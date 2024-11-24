"use client"

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateWorkspaceForm } from "./create-workspace-form";
import { useCreateWorkspaceModal } from "../hook/use-create-workspace-modal";


export const CreateWorkspaceModal = () => {

  const { isOpen, setIsOpen } = useCreateWorkspaceModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(setIsOpen)}
    >
      <CreateWorkspaceForm />
    </ResponsiveModal>
  )

}