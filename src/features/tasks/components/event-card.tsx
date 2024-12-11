import { Project } from "@/features/projects/types"
import { TaskStatus } from "../types"
import { cn } from "@/lib/utils"



interface EventCardProps {
  id: string
  title: string
  project: Project
  assignee: any
  status: TaskStatus
}

export const EventCard = ({ id, title, project, assignee, status }: EventCardProps) => {
  return (
    <div className="px-2">
      <div className={cn(
        "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition"
      )}>
        <p>
          {title}
        </p>
      </div>
    </div>
  )
}