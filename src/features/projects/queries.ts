import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { Project } from "./types";

interface GetProjectProps {
  projectId: string;
}

// Con la refactorización de use-get-project no es necesaria esta función

export const getProject = async ({ projectId }: GetProjectProps) => {        // Función para obtener un project

    const { account, databases } = await createSessionClient();                // Se crean instancias de cliente de appWrite
    const user = await account.get();                                          // se obtiene el user logueado desde la cuenta
    
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
      throw new Error("Unauthorized")
    }

    return project                                                             // Se retorna el project
}