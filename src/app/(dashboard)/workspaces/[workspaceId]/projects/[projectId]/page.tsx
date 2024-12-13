import { Button } from "@/components/ui/button"
import { getCurrent } from "@/features/auth/queries"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { getProject } from "@/features/projects/queries"
import { TasksViewSwitcher } from "@/features/tasks/components/tasks-view-switcher"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProjectIdClient } from "./client"


// interface ProjectIdPageProps{
//   params:{
//     projectId:string
//   }
// }

const ProjectIdPage = async() => {

  const user = getCurrent()
  if (!user) {
    redirect("/sign-in");
  }

  // const initialValues = await getProject({ projectId: params.projectId });
  // if(!initialValues) {
  //   throw new Error("Project not found");
  // }

  return (
    <ProjectIdClient />
  )
}

export default ProjectIdPage