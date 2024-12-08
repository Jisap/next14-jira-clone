import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskStatus } from "../types";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
}

const KanbanColumnHeader = ( { board, taskCount }: KanbanColumnHeaderProps) => {
  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        <h2 className="">
          {snakeCaseToTitleCase(board)}
        </h2>
        <div>
          {taskCount}
        </div>
      </div>
    </div>
  )
}

export default KanbanColumnHeader