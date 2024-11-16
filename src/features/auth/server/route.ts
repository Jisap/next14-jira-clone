import { Hono } from 'hono';
import { zValidator } from "@hono/zod-validator"
import { loginSchema, registerSchema } from '../schemas';
import { createAdminClient } from '@/lib/appwrite';
import { ID } from 'node-appwrite';
import { deleteCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE } from '../constants';
import { sessionMiddleware } from '@/lib/session-middleware';


const app = new Hono()
  .get(
    "/current", 
    sessionMiddleware, 
    (c) => {
      const user = c.get("user")
      return c.json({ data: user })
    }
  )
  .post(
    '/login', 
    zValidator("json", loginSchema), 
    async (c) => {
      const { email, password } = c.req.valid("json");

      const { account } = await createAdminClient();                             // Instancia del adminClient -> account
      const session = await account.createEmailPasswordSession(email, password); // En login solo se recupera la session apartir de la account

      setCookie(c, AUTH_COOKIE, session.secret, {                                // Setea cookie
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });
      
      return c.json({ succes: true })
    }
  )
  .post(
    "/register",
    zValidator("json", registerSchema),
    async (c) => {
      const { name, email, password } = c.req.valid("json");
      
      const { account } = await createAdminClient();            // Instancia del adminClient -> account
      await account.create(                                     // Crea usuario en la base de datos desde la account
        ID.unique(),
        email,
        password,
        name,
      );

      const session = await account.createEmailPasswordSession( // Crea session desde account
        email,
        password,
      );

      setCookie(c, AUTH_COOKIE, session.secret, {               // Setea cookie
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });


      return c.json({ success: true });
    }
  )
  .post("/logout", sessionMiddleware, async (c) => { // Aplica sessionMiddleware para asegurar que solo los usuarios autenticados puedan acceder a esta ruta.

    const account = await c.get("account")                 // Obtiene el account del contexto (establecido en el middleware)

    deleteCookie(c, AUTH_COOKIE);                    // Elimina cookie
    await account.deleteSession("current")           // Finaliza la sessión en Appwrite desde el account

    return c.json({ success: true })
  })

export default app;