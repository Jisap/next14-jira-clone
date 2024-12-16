import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";


// interface ProjectIdSettingsPageProps{
//   params:{
//     projectId:string
//   }
// }

const ProjectIdSettingsPage = async() => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  // const initialValues = await getProject({ projectId: params.projectId }); // Obtenemos el projectId en base al id de los params
 

  return (
    // <div className="w-full lg:max-w-xl">
    //   <EditProjectForm 
    //     initialValues={initialValues} 
    //   />
    // </div>

    <ProjectIdSettingsClient />
  )
}

export default ProjectIdSettingsPage