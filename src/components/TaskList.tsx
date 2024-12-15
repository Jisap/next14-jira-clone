import { CalendarIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-taks-modal";
import { Task } from "@/features/tasks/types";
import DottedSeparator from "./dotted-separator";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id";
import { Card, CardContent } from "./ui/card";
import { formatDistanceToNow } from "date-fns";


interface TaskListProps {
  data: Task[];
  total: number
}

export const TaskList = ({ data, total }: TaskListProps) => {

  const workspaceId = useWorkspaceId();
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
        <ul className="flex flex-col gap-y-4">
          {data.map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium truncate">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-x-2">
                      <p>{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="size-3 mr-1"/>
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>             
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          {/* Si el array data está vacío, no se renderizan elementos <li> para las tareas.
           En ese caso, el <li> con el texto "No tasks found" se convierte automáticamente en el primer y único <li> dentro del <ul>. 
           Entonces, gracias a first-of-type:block, este elemento se muestra. 
          */}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No tasks found
          </li>
        </ul>
      </div>
    </div>
  )
}