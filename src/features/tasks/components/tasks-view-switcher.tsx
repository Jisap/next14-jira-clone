"use client"

import DottedSeparator from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import { PlusIcon } from "lucide-react"
import { useCreateTaskModal } from "../hooks/use-create-taks-modal"
import { useGetTasks } from '../api/use-get-task';
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id"
import { useQueryState } from "nuqs"



export const TasksViewSwitcher = () => {

  const [view, setView] = useQueryState("tasksView", { // Establece en la url el valor de view, la cual viene del valor seleccionado en Tabs
    defaultValue: "table",
  })
  const workspaceId = useWorkspaceId()
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId })
  const { open } = useCreateTaskModal();

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
            onClick={open}
          >
            <PlusIcon className="size-4 mr-2" />
            New Task
          </Button>
        </div>
        <DottedSeparator className="my-4"/>
        Data filters
        <DottedSeparator className="my-4"/>
        <>
          <TabsContent value="table" className="mt-0">
            {JSON.stringify(tasks)}
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            {JSON.stringify(tasks)}
          </TabsContent>
          <TabsContent value="calendar" className="mt-0">
            {JSON.stringify(tasks)}
          </TabsContent>
        </>
      </div>
    </Tabs>
  )
}