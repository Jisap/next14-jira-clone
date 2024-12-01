import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user")
      const databases = c.get("databases")
      const { workspaceId } = c.req.valid("query")
      const member = await getMember({                       // Verifica si el usuario logueado que realiza la petición pertenece a un workspace
        databases,
        workspaceId,
        userId: user.$id
      })

      if(!member) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const projects = await databases.listDocuments(       // Si el usuario logueado es un miembro del workspace, devuelve todos los proyectos del workspace
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("createdAt"),
        ],
      );
      
      return c.json({ data: projects })
    }
  )

export default app