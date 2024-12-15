"use client"


import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id";
import tasks from '@/features/tasks/server/route';
import { useCreateProjectModal } from "@/features/projects/hook/use-create-project-modal";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-taks-modal";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Analytics } from "@/components/analytics";


export const WorkspaceIdClient = () => {

  const workspaceId = useWorkspaceId();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

  const { open: createProject } = useCreateProjectModal();
  const { open: createTask } = useCreateTaskModal();

  const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;

  if (isLoading) {
    return <PageLoader />
  }

  if(!analytics || !tasks || !projects || !members){
    return <PageError message="Failed to load workspace data" />
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics 
        data={analytics}
      />
    </div>
  )
}