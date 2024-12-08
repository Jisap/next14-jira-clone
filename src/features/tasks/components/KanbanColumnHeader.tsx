import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskStatus } from "../types";
import * as React from 'react';
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTaskModal } from "../hooks/use-create-taks-modal";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
};

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: (<CircleDashedIcon className="size-[18px] text-pink-400" />),
  [TaskStatus.TODO]: (<CircleIcon className="size-[18px] text-red-400" />),
  [TaskStatus.IN_PROGRESS]: (<CircleDotDashedIcon className="size-[18px] text-yellow-400" />),
  [TaskStatus.IN_REVIEW]: (<CircleDotIcon className="size-[18px] text-blue-400" />),
  [TaskStatus.DONE]: (<CircleCheckIcon className="size-[18px] text-emerald-400" />),
}

const KanbanColumnHeader = ( { board, taskCount }: KanbanColumnHeaderProps) => {

  const { open } = useCreateTaskModal(); // open establece isOpen a true -> y <CreateTaskModal /> que está en el layout abre <ResponsiveModal />

  const icon = statusIconMap[board];

  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">
          {snakeCaseToTitleCase(board)}
        </h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
          {taskCount}
        </div>
      </div>
      <Button
        onClick={open} // Al clickear isOpen se establece a true -> y <CreateTaskModal /> que está en el layout abre <ResponsiveModal />
        variant="ghost"
        size="icon"
        className="size-5"
      >
        <PlusIcon  className="size-4 text-neutral-500"/>
      </Button>
    </div>
  )
}

export default KanbanColumnHeader