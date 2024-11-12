import { Hono } from 'hono';
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";

const app = new Hono().basePath('/api') // Hono maneja las rutas de la aplicación basado la ruta del /features/server
  
const routes = app 
  .route("/auth", auth)



export const GET = handle(app)

export type AppType = typeof routes 