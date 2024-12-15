import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-taks-modal";
import { Task } from "@/features/tasks/types";
import DottedSeparator from "./dotted-separator";

interface TaskListProps {
  data: Task[];
  total: number
}

export const TaskList = ({ data, total }: TaskListProps) => {

  const { open: createTask } = useCreateTaskModal();

  return(
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Tasks ({total})
          </p>
          <Button
            variant="muted"
            size="icon"
            onClick={createTask}
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
      </div>
    </div>
  )
}