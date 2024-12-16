import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import DottedSeparator from "./dotted-separator";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id";
import { Card, CardContent } from "./ui/card";
import { Project } from "@/features/projects/types";
import { useCreateProjectModal } from "@/features/projects/hook/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";


interface ProjecListProps {
  data: Project[];
  total: number
}

export const ProjectList = ({ data, total }: ProjecListProps) => {

  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Projects ({total})
          </p>
          <Button
            variant="secondary"
            size="icon"
            onClick={createProject}
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((project) => (
            <li key={project.$id}>
              <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4 flex items-center gap-x-2.5">
                    <ProjectAvatar 
                      name={project.name} 
                      image={project.imageUrl}
                      fallbackClassName="text-lg"
                      className="size-12"
                    />
                    <p className="text-lg font-medium truncate">
                      {project.name}
                    </p>
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
            No projects found
          </li>
        </ul>
      </div>
    </div>
  )
}