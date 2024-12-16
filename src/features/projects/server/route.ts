import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";
import  { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases")                         // Obtiene el databases del contexto (establecido en el middleware)
      const user = c.get("user")                                   // Obtiene el user del contexto (establecido en el middleware)

      const { name, image, workspaceId } = c.req.valid("form")     // Se valida el request (nombre del proyecto, la imagen y el workspaceId) según su esquema

      const member = await getMember({                             // Se comprueba si el usuario es miembro del workspace
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({ error: "Unauthorized" }, 401)              // Si el usuario no es miembro del workspace se retorna un error
      }


      let uploadedImageUrl: string | undefined;                    // Definimos una variable que almacenará la URL de la imagen subida
      const storage = c.get("storage")                             // Se obtiene el storage del contexto (establecido en el middleware)

      if (image instanceof File) {                                 // Si la imagen es un objeto File
        const file = await storage.createFile(                     // Se crea el archivo en la base de datos de Appwrite
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );
        const arrayBuffer = await storage.getFilePreview(          // Se obtiene la vista previa del archivo
          IMAGES_BUCKET_ID,
          file.$id,
        );
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`; // Se crea la URL de la imagen subida
      }

      const project = await databases.createDocument(              // Se crea el projecto en la base de datos
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,                                                    // y se almacena el nombre del workspace
          imageUrl: uploadedImageUrl,                              // y la URL de la imagen subida (avatar)
          workspaceId                                              // y el workspace al que pertenece
        }
      );

      

      return c.json({ data: project })
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {

      const user = c.get("user")
      const databases = c.get("databases")
      const { workspaceId } = c.req.valid("query")
      if(!workspaceId) {
        return c.json({error: "Missing workspaceId"}, 400)
      }


      const member = await getMember({                       // Verifica si el usuario logueado que realiza la petición pertenece a un workspace
        databases,
        workspaceId,
        userId: user.$id
      })

      if(!member) {
        return c.json({error: "Unauthorized"}, 401)
      }

      const projects = await databases.listDocuments<Project>( // Si el usuario logueado es un miembro del workspace, devuelve todos los proyectos del workspace
        DATABASE_ID,
        PROJECTS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.orderDesc("$createdAt"),
        ],
      );
      
      return c.json({ data: projects })
    }
  )
  .get(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { projectId } = c.req.param();

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });

      if(!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data: project });
    }
  )
  .patch(
    "/:projectId",                                // param
    sessionMiddleware,                            // usuario autenticado
    zValidator("form", updateProjectSchema),      // info del formulario validado según su esquema
    async (c) => {
      const databases = c.get("databases")
      const storage = c.get("storage")
      const user = c.get("user")

      const { projectId } = c.req.param()
      const { name, image } = c.req.valid("form")

      const existingProject = await databases.getDocument<Project>(  // Obtenemos el proyecto
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      )

      const member = await getMember({                               // Obtenemos el miembro del workspace asociado al proyecto
        databases, 
        workspaceId: existingProject.workspaceId, 
        userId: user.$id 
      }) 

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401)                // Validamos que el miembro pertenezca al workspace para poder actualizarlo
      }

      let uploadedImageUrl: string | undefined;                      // Definimos una variable que almacenará la URL de la imagen subida

      if (image instanceof File) {                                   // Si la imagen es un objeto File
        const file = await storage.createFile(                       // Se crea el archivo en la base de datos de Appwrite
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );
        const arrayBuffer = await storage.getFilePreview(            // Se obtiene la vista previa del archivo
          IMAGES_BUCKET_ID,
          file.$id,
        );
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`; // Se crea la URL de la imagen subida
      } else {
        uploadedImageUrl = image                                     // Si la imagen no es un objeto File se almacena como string
      }

      const project = await databases.updateDocument(                // Se actualiza el project en la base de datos
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,                                                     // y se almacena el nombre del workspace
          imageUrl: uploadedImageUrl,                               // y la URL de la imagen subida (avatar)
        }
      );

      return c.json({ data: project })
    }
  )
  .delete(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases")
      const user = c.get("user")
      const { projectId } = c.req.param()

      const existingProject = await databases.getDocument<Project>(  // Obtenemos el proyecto
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      )


      const member = await getMember({                               // Obtenemos el miembro del workspace asociado al proyecto
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      })
      if (!member) {
        return c.json({ error: "You are not authorized to perform this action" }, 401) // Validamos que exista un miembro del workspace para poder borrarlo
      }

      // TODO: Delete members, projects and tasks

      await databases.deleteDocument(                                // Se elimina el workspace en la base de datos
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      return c.json({ data: { $id: existingProject.$id } })          // Se retorna el id del proyecto eliminado
    }
  )
  .get(
    "/:projectId/analytics",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases")
      const user = c.get("user")
      const { projectId } = c.req.param()

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const now = new Date();                                    // Obtenemos la fecha actual
      const thisMonthStart = startOfMonth(now);                  // Obtenemos la fecha del comienzo del mes actual
      const thisMonthEnd = endOfMonth(now);                      // Obtenemos la fecha del final del mes actual
      const lastMonthStart = startOfMonth(subMonths(now, 1));    // Obtenemos la fecha del comienzo del mes anterior
      const lastMonthEnd = endOfMonth(subMonths(now, 1));        // Obtenemos la fecha del final del mes anterior
    
      const thisMonthTasks = await databases.listDocuments(                       // Obtenemos las tareas del mes actual
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
        ],
      );

      const lastMonthTasks = await databases.listDocuments(                       // Obtenemos las tareas del mes anterior
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes anterior
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes anterior
        ],
      );

      const taskCount = thisMonthTasks.total;                                     // Número de tareas del mes actual
      const taskDifference = taskCount - lastMonthTasks.total;                    // Diferencia de tareas entre el mes actual y el anterior
    
      const thisMonthAssignedTasks = await databases.listDocuments(               // Obtenemos las tareas assignadas del mes actual
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.equal("assigneeId", member.$id),                                  // que tengan un usuario asignado igual al usuario logueado (member del workspace)
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
        ],
      );

      const lastMonthAssignedTasks = await databases.listDocuments(               // Obtenemos las tareas assignadas del mes pasado
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.equal("assigneeId", member.$id),                                  // que tengan un usuario asignado igual al usuario logueado (member del workspace)
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes passado
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes pasado
        ],
      );

      const assignedTaskCount = thisMonthAssignedTasks.total;                     // Número de tareas asignadas del mes actual
      const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;  // Diferencia de tareas asignadas entre el mes actual y el anterior
  
      const thisMonthIncompleteTasks = await databases.listDocuments(             // Obtenemos las tareas incompletas del mes actual
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
        ],
      );

      const lastMonthIncompleteTasks = await databases.listDocuments(             // Obtenemos las tareas incompletas del mes pasado
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                 // para el proyecto especificado
          Query.notEqual("status", TaskStatus.DONE),                           // que tengan un estado diferente a "DONE"
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),  // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes passado
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),       // y que tengan una fecha de creación menor o igual a la fecha del final del mes pasado
        ],
      );

      const incompleteTaskCount = thisMonthIncompleteTasks.total;                 // Número de tareas incompletas del mes actual
      const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;  // Diferencia de tareas incompletas entre el mes actual y el anterior
    
      const thisMonthCompletedTasks = await databases.listDocuments(              // Obtenemos las tareas incompletas del mes actual
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.equal("status", TaskStatus.DONE),                                 // que tengan un estado igual a "DONE"
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
        ],
      );

      const lastMonthCompletedTasks = await databases.listDocuments(              // Obtenemos las tareas completas del mes pasado
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.equal("status", TaskStatus.DONE),                                 // que tengan un estado igual a "DONE"
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes passado
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes pasado
        ],
      );

      const completedTaskCount = thisMonthCompletedTasks.total;                   // Número de tareas completas del mes actual
      const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;  // Diferencia de tareas completas entre el mes actual y el anterior

      const thisMonthOverdueTasks = await databases.listDocuments(                // Obtenemos las tareas no vencidas del mes actual
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
          Query.lessThan("dueDate", now.toISOString()),                          // que tengan una fecha de vencimiento menor o igual a la fecha actual
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
        ],
      );

      const lastMonthOverdueTasks = await databases.listDocuments(                // Obtenemos las tareas no vencidas del mes pasado
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("projectId", projectId),                                    // para el proyecto especificado
          Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
          Query.lessThan("dueDate", now.toISOString()),                          // que tengan una fecha de vencimiento menor o igual a la fecha actual
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes passado
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes pasado
        ],
      );

      const overdueTaskCount = thisMonthOverdueTasks.total;                       // Número de tareas no vencidas del mes actual
      const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;  // Diferencia de tareas no vencidas entre el mes actual y el anterior
      
      return c.json({
        data: {
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          completedTaskCount,
          completedTaskDifference,
          overdueTaskCount,
          overdueTaskDifference,
        }
      })
    }
  )
  

export default app