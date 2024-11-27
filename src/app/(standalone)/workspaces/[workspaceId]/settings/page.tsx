import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";


interface WorkspaceIdSettingsPageProps {
  params: {
    workspaceId: string;
  }
}

const WorkspaceIdSettingsPage = async({ params }: WorkspaceIdSettingsPageProps) => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  const initialValues = await getWorkspace({ workspaceId: params.workspaceId }); // Obtenemos el workspace en base al id de los params
  if(!initialValues){                                                            // Si no existe el workspace 
    redirect(`/workspaces/${params.workspaceId}`);                               // se redirige a la página de creación 
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm 
        initialValues={initialValues}
      />
    </div>
  )
}

export default WorkspaceIdSettingsPage