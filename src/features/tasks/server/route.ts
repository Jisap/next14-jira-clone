import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schema";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";



const app = new Hono()
 .post(
  "/",
  sessionMiddleware,                                                                                               // Verificar si el usuario está autenticado
  zValidator("json", createTaskSchema),                                                                            // Validar el body de la petición según el esquema
  async (c, next) => {                                                                                             // Establecido el contexto obtenemos lo siguiente:
    
    const user = c.get("user");
    const databases = c.get("databases");
    const { name, status, workspaceId, projectId, dueDate, assigneeId, description } = c.req.valid("json")
  
    const member = await getMember({                                                                               // Obtenemos el usuario asociado al workspace
      databases,
      workspaceId,
      userId: user.$id,
    });

    if(!member){
      return c.json({ error: "Unauthorized" }, 401);                                                               // Validamos que el usuario pertenezca al workspace
    }

    const highestPositionTaks = await databases.listDocuments(                                                     // Se determina la tarea con la posición más baja dentro de un workspaceId y un status
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("status", status),
        Query.equal("workspaceId", workspaceId),
        Query.orderAsc("position"),
        Query.limit(1)   
      ],
    );

    const newPosition =                                                                                             // Se calcula la nueva posición de la tarea nueva
      highestPositionTaks.documents.length > 0
        ? highestPositionTaks.documents[0].position + 1000
        : 1000

    const task = await databases.createDocument(                                                                    // Se crea la tarea nueva
      DATABASE_ID,
      TASKS_ID,
      ID.unique(),
      {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        position: newPosition,
      }
    )

    return c.json({ data: task });
  }

 )


export default app;