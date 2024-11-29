import { getCurrent } from "@/features/auth/queries"
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";


interface WorkspaceIdJoinPageProps {
  params: {
    workspaceId: string;
  }
}


const WorkspaceIdJoinPage = async({ params }: WorkspaceIdJoinPageProps) => {

  const user = await getCurrent(); // Obtenemos el user logueado
  if(!user){
    redirect("/sign-in")
  }

  const workspace = await getWorkspaceInfo({ // obtenemos el name del workspace
    workspaceId: params.workspaceId,
  })

  return (
    <div>
      {JSON.stringify(workspace)}
    </div>
  )
}

export default WorkspaceIdJoinPage