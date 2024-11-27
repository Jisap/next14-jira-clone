"use server"

//import { cookies } from "next/headers"
//import { Account, Client } from "node-appwrite"
//import { AUTH_COOKIE } from "./constants"
import { createSessionClient } from "@/lib/appwrite"


export const getCurrent = async() => { // Función para obtener el user logueado

  try { 
    
    // const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
    //   .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
    //   .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto

    // const session = cookies().get(AUTH_COOKIE)                              // session desde las cookies según next
    // if(!session) {
    //   console.log("No session cookie found");
    //   return null;                                                          // Sino existe session -> null
    // }

    // client.setSession(session.value);                                       // se establece la session en el client

    // const account = new Account(client);                                    // Se crean una account basada en el client de appWrite 

    const { account } = await createSessionClient();
    const user = await account.get();                                          // se retorna el user logueado desde la cuenta
    return user;
  
} catch(error){
    console.error("Error fetching current user:", error);
    return null
}

}

