"use client"

import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PencilIcon } from 'lucide-react';
import { TasksViewSwitcher } from '@/features/tasks/components/tasks-view-switcher';
import { useProjectId } from '@/features/projects/hook/use-project-id';
import { useGetProject } from '@/features/projects/api/use-get-project';
import { PageLoader } from '../../../../../../components/page-loader';
import { PageError } from '@/components/page-error';

export const ProjectIdClient = () => {

  const projectId = useProjectId();
  const { data, isLoading } = useGetProject({ projectId });
console.log(data);
  if(isLoading) {
    return <PageLoader />
  }

  if(!data) {
    return <PageError message="Project not found" />
  }



  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            image={data.imageUrl}
            name={data.name}
            className="size-8"
          />
          <p className="text-lg font-bold">
            {data.name}
          </p>
        </div>

        <div>
          <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <Link href={`/workspaces/${data?.workspaceId}/projects/${data.$id}/settings`}>
              <PencilIcon className="size-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>

      <TasksViewSwitcher hideProjectFilter />

    </div>
  )
}