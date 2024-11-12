import { Hono } from 'hono';
import { zValidator } from "@hono/zod-validator"
import { z } from 'zod';
import { loginSchema } from '../schemas';



const app = new Hono()
  .post(
    '/login', 
    zValidator("json", loginSchema), 
    async (c) => {
      return c.json({ success: "ok" })
    }
  )

export default app;