"use server"

import { cookies } from "next/headers"
import { Account, Client } from "node-appwrite"
import { AUTH_COOKIE } from "./constants"

export const getCurrent = async() => {

  try {

    const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto
  
    const session = await cookies().get(AUTH_COOKIE) // session desde las cookies según next
    if(!session) return null;                        // Sino existe session -> null
  
    const account = new Account(client); // Se crean una account basada en el client de appWrite 
  
    return await account.get();          // se retorna la account creada que contiene la info del usuario logueado
  
  } catch {
    return null
  }

}