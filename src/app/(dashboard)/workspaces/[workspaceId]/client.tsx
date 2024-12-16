"use client"


import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Analytics } from "@/components/analytics";
import { TaskList } from "@/components/TaskList";
import { ProjectList } from "@/components/ProjectList";
import { MemberList } from "@/components/MemberList";


export const WorkspaceIdClient = () => {

  const workspaceId = useWorkspaceId();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  

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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TaskList 
          data={tasks.documents} 
          total={tasks.total}  
        />
        <ProjectList 
          data={projects.documents} 
          total={projects.total}
        />
        <MemberList
          data={members.documents} 
          total={members.total}
        />
      </div>
    </div>
  )
}

