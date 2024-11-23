"use server"

import { cookies } from "next/headers"
import { Account, Client, Databases, Query } from "node-appwrite"
import { AUTH_COOKIE } from "@/features/auth/constants"
import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config"


export const getWorkspaces = async() => { // Función para obtener los workspaces del usuario logueado

  try { 
    
    const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto
      //.setKey(process.env.NEXT_APPWRITE_KEY!);

    const session = cookies().get(AUTH_COOKIE)                              // session desde las cookies según next
    if(!session) {
      console.log("No session cookie found");
      return { documents: [], total: 0 }                                    // Sino existe session -> objeto vacio
    }

    client.setSession(session.value);                                       // se establece la session en el client

    const account = new Account(client);                                    // Se crean una account basada en el client de appWrite que contiene la session
    const user = await account.get();                                       // se obtiene el user logueado desde la cuenta
    
    const databases = new Databases(client);                                // Se crean una instancia de databases basada en el client de appWrite 
    const members = await databases.listDocuments(                          // Desde databases se obtienen los members cuyo userId coincida con el user logueado
      DATABASE_ID,                                                          // En appWrite por cada workspace se crea un member, aunque sea el mismo user
      MEMBERS_ID,
      [Query.equal("userId", user.$id)],
    );

    if (members.total === 0) {
      return { documents: [], total: 0 } 
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId); // Se obtienen los IDs de los workspaces asociados al usuario logueado

    const workspaces = await databases.listDocuments(                       // Con esos IDs se obtienen los workspaces
      DATABASE_ID,
      WORKSPACE_ID,
      [
        Query.orderDesc("$createdAt"),                                      // ordenados por fecha de creación
        Query.contains("$id", workspaceIds),
      ]
    );

    return workspaces
  
} catch(error){
    console.error("Error fetching current user:", error);
    return { documents: [], total: 0 }
}

}

