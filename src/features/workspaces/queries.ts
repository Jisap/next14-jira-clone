"use server"

//import { cookies } from "next/headers"
//import { Account, Client, Databases, Query } from "node-appwrite"
//import { AUTH_COOKIE } from "@/features/auth/constants"
import  { Query } from "node-appwrite"
import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config"
import { getMember } from "../members/utils"
import { Workspace } from "./types"
import { createSessionClient } from "@/lib/appwrite"


export const getWorkspaces = async() => { // Función para obtener los workspaces del usuario logueado
    
    // const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
    //   .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
    //   .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto

    // const session = cookies().get(AUTH_COOKIE)                              // session desde las cookies según next
    // if(!session) {
    //   console.log("No session cookie found");
    //   return { documents: [], total: 0 }                                    // Sino existe session -> objeto vacio
    // }

    // client.setSession(session.value);                                       // se establece la session en el client

    // const account = new Account(client);                                    // Se crean una account basada en el client de appWrite que contiene la session
    
    const { account, databases } = await createSessionClient();
    const user = await account.get();                                          // se obtiene el user logueado desde la cuenta
    
    //const databases = new Databases(client);                                 // Se crean una instancia de databases basada en el client de appWrite 
    
    const members = await databases.listDocuments(                             // Desde databases se obtienen los members cuyo userId coincida con el user logueado
      DATABASE_ID,                                                             // En appWrite cada vez que un usario se une a un workspace se crea un member.
      MEMBERS_ID,
      [Query.equal("userId", user.$id)],
    );

    // {
    //   documents: [
    //     { $id: "member1", userId: "user123", workspaceId: "workspaceA" },
    //     { $id: "member2", userId: "user123", workspaceId: "workspaceB" }
    //   ],
    //     total: 2
    // }

    if (members.total === 0) {                                                  // Verificamos si hay resultados, si el user no esta asociado a ningun workspace se retorna un objeto vacio
      return { documents: [], total: 0 } 
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId); // Extrae el campo workspaceId de cada documento en members.documents. Se obtienen asi los IDs de los workspaces asociados al usuario logueado

    const workspaces = await databases.listDocuments(                           // Con esos IDs se obtienen los workspaces
      DATABASE_ID,
      WORKSPACE_ID,
      [
        Query.orderDesc("$createdAt"),                                          // ordenados por fecha de creación
        Query.contains("$id", workspaceIds),
      ]
    );

    return workspaces
  
}


interface GetWorkspaceProps {
  workspaceId: string;
}

// No se usa despues de la refactorización
export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => { // Función para obtener un workspace 

    // const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
    //   .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
    //   .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto
    

    // const session = await cookies().get(AUTH_COOKIE)                        // session desde las cookies según next
    // if (!session) return null 

    // client.setSession(session.value);                                       // se establece la session en el client

    // const account = new Account(client);                                    // Se crean una account basada en el client de appWrite que contiene la session
    
    const { account, databases } = await createSessionClient();
    const user = await account.get();                                          // se obtiene el user logueado desde la cuenta
    // const databases = new Databases(client);                                // Se crean una instancia de databases basada en el client de appWrite 
    
    const member = await getMember({                                           // Registro del miembro del workspace
      databases,
      userId: user.$id,
      workspaceId,
    })

    if (!member) {                                                             // Se verifica si el usuario es miembro del workspace
      throw new Error("Unauthorized")
    }

    const workspace = await databases.getDocument<Workspace>(                  // Se obtiene el workspace basado en el Id del param
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );

    return workspace

}

interface GetWorkspaceInfoProps {
  workspaceId: string;
}

// No se usa despues de la refactorización
export const getWorkspaceInfo = async ({ workspaceId }: GetWorkspaceInfoProps) => { // Función para obtener un workspace 

    const { databases } = await createSessionClient();                // Se crean instancias de cliente de appWrite
   
    const workspace = await databases.getDocument<Workspace>(                  // Se obtiene el workspace basado en el Id del param
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );

    return {
      name: workspace.name,
    }
}

