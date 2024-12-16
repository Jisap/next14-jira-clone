
import { getCurrent } from "@/features/auth/queries"
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