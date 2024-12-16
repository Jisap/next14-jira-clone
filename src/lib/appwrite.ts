import "server-only";

import { 
  Client, 
  Account,
  Users,
  Databases,
} from "node-appwrite";
import { cookies } from "next/headers";                                   // cookie segun next. Es un objeto y tiene un value
import { AUTH_COOKIE } from "@/features/auth/constants";


export async function createSessionClient() {
  const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto

  const session = cookies().get(AUTH_COOKIE)                              // session desde las cookies según next
  if (!session || !session.value) {
    throw new Error("Unauthorized")                                       // Sino existe session -> Error
  }

  client.setSession(session.value);                                       // se establece la session en el client

  return {                                                                // Devuelve un objeto que permite acceder al módulo Account vinculado al cliente configurado.
    get account() {                                                       // Cada vez que se acceda a la propiedad account, se creará una nueva instancia de Account
      return new Account(client);                                         // Una vez tienes la instancia de Account, puedes llamar a métodos como: get(), create(), createEmailPasswordSession()
    },
    get databases() {
      return new Databases(client);
    }
  };
}


export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {                        // Devuelve un objeto que permite acceder al módulo Account vinculado al cliente configurado.
    get account() {               // Cada vez que se acceda a la propiedad account, se creará una nueva instancia de Account
      return new Account(client); // Una vez tienes la instancia de Account, puedes llamar a métodos como: get(), create(), createEmailPasswordSession()
    },
    get users(){
      return new Users(client);   // Tambien con el client se puede acceder a los módulos de Users
    }

  };
}