import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { Project } from "./types";

interface GetProjectProps {
  projectId: string;
}

export const getProject = async ({ projectId }: GetProjectProps) => {        // Función para obtener un project

  try {

    const { account, databases } = await createSessionClient();                // Se crean instancias de cliente de appWrite
    const user = await account.get();                                          // se obtiene el user logueado desde la cuenta
    // const databases = new Databases(client);                                // Se crean una instancia de databases basada en el client de appWrite 


    const project = await databases.getDocument<Project>(                      // Se obtiene el project basado en el Id del param
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({                                           // Registro del miembro del workspace asociado al project
      databases,
      userId: user.$id,
      workspaceId: project.workspaceId,
    })

    if (!member) {                                                             // Se verifica si el usuario es miembro del workspace
      return null
    }

    return project                                                             // Se retorna el project

  } catch (error) {
    console.error("Error fetching current user:", error);
    return null
  }

}