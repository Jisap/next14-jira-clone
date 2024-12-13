import { getCurrent } from "@/features/auth/queries"
//import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
//import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdJoinClient } from "./client";


// interface WorkspaceIdJoinPageProps {
//   params: {
//     workspaceId: string;
//   }
// }


const WorkspaceIdJoinPage = async() => {

  const user = await getCurrent(); // Obtenemos el user logueado
  if(!user){
    redirect("/sign-in")
  }

  // const initialValues = await getWorkspaceInfo({ // obtenemos el name del workspace
  //   workspaceId: params.workspaceId,
  // })

  // if(!initialValues){
  //   redirect("/")
  // }

  return (
    // <div className="w-full lg:max-w-xl">
    //   <JoinWorkspaceForm initialValues={initialValues} />
    // </div>

    <WorkspaceIdJoinClient />
  )
}

export default WorkspaceIdJoinPage