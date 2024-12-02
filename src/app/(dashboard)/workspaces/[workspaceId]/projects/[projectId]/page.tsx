import { getCurrent } from "@/features/auth/queries"
import { redirect } from "next/navigation"


interface ProjectIdPageProps{
  params:{
    projectId:string
  }
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {

  const user = getCurrent()
  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div>
      ProjectId: {params.projectId}
    </div>
  )
}

export default ProjectIdPage