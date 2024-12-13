import { getCurrent } from "@/features/auth/queries";
// import { getWorkspace } from "@/features/workspaces/queries";
// import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";


// interface WorkspaceIdSettingsPageProps {
//   params: {
//     workspaceId: string;
//   }
// }

const WorkspaceIdSettingsPage = async() => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  //const initialValues = await getWorkspace({ workspaceId: params.workspaceId }); // Obtenemos el workspace en base al id de los params

  return (
    // <div className="w-full lg:max-w-xl">
    //   <EditWorkspaceForm 
    //     initialValues={initialValues}
    //   />
    // </div>

    <WorkspaceIdSettingsClient />
  )
}

export default WorkspaceIdSettingsPage