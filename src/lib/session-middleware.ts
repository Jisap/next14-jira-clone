import "server-only"

import {
  Account,
  Client,
  Databases,
  Models,
  Storage,
  type Account as AccountType,
  type Databases as DatabasesType,
  type Storage as StorageType,
  type Users as UsersType,
} from "node-appwrite";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AUTH_COOKIE } from "../features/auth/constants";

type AdditionalContext = {
  Variables: {
    account: AccountType;
    databases: DatabasesType;
    storage: StorageType;
    users: UsersType;
    user: Models.User<Models.Preferences>
  }
}

// Este middleware está diseñado para autenticar usuarios a través de una cookie de sesión 
// y proporcionar acceso a las instancias de servicios de Appwrite en el contexto de cada solicitud. 

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async(c, next) => {
    const client = new Client()                                             // Se crea una instancia de Client de Appwrite, 
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)              // configurada con el endpoint 
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)                // y el ID del proyecto

    const session = getCookie(c, AUTH_COOKIE)                               // Se busca la cookie para verificar si el usuario tiene una sesión activa. 

    if(!session){
      return c.json({ error: "Unauthorized" }, 401)                         // Si no existe una sesión, se devuelve un error 401
    }

    client.setSession(session)                                              // Si existe una sesión, se establece en el client

    const account = new Account(client)                                     // Se crean instancias de los servicios de Appwrite 
    const databases = new Databases(client)
    const storage = new Storage(client)
    
    const user = await account.get()                                        // Llama a la API de Appwrite para obtener información del usuario actual.

    c.set("account", account)                                               // Se establecen las instancias de los servicios de Appwrite en el contexto del servidor
    c.set("databases", databases)                                           // permitiendo que otros middlewares o manejadores de rutas accedan a ellas
    c.set("storage", storage)
    c.set("user", user)

    await next()                                                            // Finalmente, el middleware llama a next() para que la solicitud continúe hacia el siguiente middleware o controlador de la ruta.
  }
)
