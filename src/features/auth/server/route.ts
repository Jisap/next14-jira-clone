import { Hono } from 'hono';
import { zValidator } from "@hono/zod-validator"
import { loginSchema, registerSchema } from '../schemas';
import { createAdminClient } from '@/lib/appwrite';
import { ID } from 'node-appwrite';
import { deleteCookie, setCookie } from 'hono/cookie';
import { AUTH_COOKIE } from '../constants';


const app = new Hono()
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
      
      const { account } = await createAdminClient(); // Instancia del adminClient -> account
      await account.create(                          // Crea usuario en la base de datos desde la account
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
  .post("/logout",  async (c) => {
    deleteCookie(c, AUTH_COOKIE);

    return c.json({ success: true })
  })

export default app;