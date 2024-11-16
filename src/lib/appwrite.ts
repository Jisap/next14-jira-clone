import "server-only";

import { 
  Client, 
  Account,
  Storage,
  Users,
  Databases,
} from "node-appwrite";

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {                        // Devuelve un objeto que permite acceder al módulo Account vinculado al cliente configurado.
    get account() {               // Cada vez que se acceda a la propiedad account, se creará una nueva instancia de Account
      return new Account(client); // Una vez tienes la instancia de Account, puedes llamar a métodos como: get(), create(), createEmailPasswordSession()
    },
  };
}