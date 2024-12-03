import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schema";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import projects from '@/features/projects/server/route';
import { Project } from "@/features/projects/types";



const app = new Hono()
  .get(
    "/",
    sessionMiddleware,                                                    // Nos aseguramos de que el usuario esté autenticado
    zValidator(                                                           // Validamos que el usuario envió los parámetros correctos
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c, next) => {
      const users = await createAdminClient();                             // Users registrados en appWrite
      const databases = c.get("databases");                                // Base de datos de appWrite
      const user = c.get("user");                                          // Usuario autenticado

      const { 
        workspaceId, 
        projectId, 
        assigneeId, 
        status, 
        search, 
        dueDate 
      } = c.req.valid("query");                                            // Parámetros de la consulta validados con Zod

      const member = await getMember({                                     // Obtenemos el usuario asociado al workspace
        databases,
        workspaceId,
        userId: user.$id,
      });

      if(!member){
        return c.json({ error: "Unauthorized" }, 401);                     // Validamos que el usuario pertenezca al workspace
      }

      const query = [                                                      // Creamos un filtro básico 
        Query.equal("workspaceId", workspaceId),                           // para buscar documentos lmitados a un workspace
        Query.orderDesc("$createdAt")                                      // ordenados por fecha, priorizando los más recientes.
      ]

      if (projectId) {                                                     // Agrega un filtro al array query 
        console.log("projectId", projectId)                                // que asegura que solo se seleccionen documentos donde el campo projectId coincida con el valor proporcionado.
        query.push(Query.equal("projectId", projectId))
      }

      if (status) {                                                        // Idem con status
        console.log("status", status)
        query.push(Query.equal("status", status))
      }

      if (assigneeId){                                                     // Idem con assigneeId
        console.log("assigneeId", assigneeId)
        query.push(Query.equal("assigneeId", assigneeId))
      }

      if (dueDate) {                                                       // Idem con dueDate
        console.log("dueDate", dueDate)
        query.push(Query.equal("dueDate", dueDate))
      }

      if (search) {                                                        // Idem con search
        console.log("search", search)
        query.push(Query.equal("search", search))
      }

      const tasks = await databases.listDocuments(                         // Ejecuta la consulta para obtener las tareas filtradas en la base de datos.
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map(task => task.projectId);       // Extraemos los ids de los proyectos de las tareas
      const assigneeIds = tasks.documents.map(task => task.assigneeId);     // Extraemos los ids de los usuarios asignados a las tareas

      const projects = await databases.listDocuments<Project>(              //se obtiene la información de los proyectos correspondientes a las tareas.
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0
          ? [Query.contains("$id", projectIds)]
          : []
      )  
      
      const assignees = await databases.listDocuments(                      // Se obtiene la información de los usuarios  asignados a las tareas.
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0
          ? [Query.contains("$id", assigneeIds)]
          : []
      )    
      
      const populatedTasks = tasks.documents.map((task) => {                // Cada tarea es enriquecida con los detalles de su proyecto y su miembro asignado.
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );

        const assignee = assignees.documents.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee
        }
      })

      return c.json({                                                       // Finalmente se retornan las tareas y cada tarea enriquecida                                                    
        data: {
          ...tasks,
          documents: populatedTasks
        }
      })
    }
 )
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