"use client"

import DottedSeparator from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import { Loader, PlusIcon } from "lucide-react"
import { useCreateTaskModal } from "../hooks/use-create-taks-modal"
import { useGetTasks } from '../api/use-get-tasks';
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id"
import { useQueryState } from "nuqs"
import { DataFilters } from "./data-filters"
import { useTaksFilters } from "../hooks/use-taks-filters"
import { DataTable } from "./data-table"
import { columns } from './columns';
import { DataKanban } from "./data-kanban"
import { TaskStatus } from '../types';
import { useCallback } from "react"
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks"
import { DataCalendar } from "./data-calendar"
import { useProjectId } from "@/features/projects/hook/use-project-id"

interface TasksViewSwitcherProps {
  hideProjectFilter?: boolean;
}


export const TasksViewSwitcher = ({ hideProjectFilter }: TasksViewSwitcherProps) => {


  const [{
    status,
    assigneeId,
    projectId,
    dueDate,
  }] = useTaksFilters(); // Estado con nuqs

  const [view, setView] = useQueryState("tasksView", { // Establece en la url el valor de view, la cual viene del valor seleccionado en Tabs
    defaultValue: "table",
  })

  const workspaceId = useWorkspaceId()
  const paramProjectId = useProjectId()
  const { open } = useCreateTaskModal(); // open establece isOpen a true

  const { mutate: bulkUpdate } = useBulkUpdateTasks();

  const { 
    data: tasks,
     isLoading: isLoadingTasks 
  } = useGetTasks({                  // Se obtienen las tareas según status
    workspaceId,
    projectId: paramProjectId || projectId,
    assigneeId,
    status,
    dueDate,
  });

  const onKambanChange = useCallback((
    tasks: {$id:string; status:TaskStatus; position:number}[]
  ) => {
    bulkUpdate({
      json: { tasks }
    })
  },[bulkUpdate])


  return (
    <Tabs 
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value="table"
            >
              Table
            </TabsTrigger>
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value="kanban"
            >
              Kaban
            </TabsTrigger>
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value="calendar"
            >
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button
            size="sm"
            className="w-full lg:w-auto"
            onClick={open} // Al clickear isOpen se establece a true -> y <CreateTaskModal /> que está en el layout abre <ResponsiveModal /> 
          >
            <PlusIcon className="size-4 mr-2" />
            New Task
          </Button>
        </div>
        <DottedSeparator className="my-4"/>
          {/* DataFilter establece con nuqs el estado de status y lo refleja en la url */}
          <DataFilters 
            hideProjectFilter={hideProjectFilter}
          />
        <DottedSeparator className="my-4"/>
        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ):(
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable 
                columns={columns}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban 
                data={tasks?.documents ?? []}
                onChange={onKambanChange}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalendar data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  )
}