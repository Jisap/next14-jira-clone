import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACE_ID } from "@/config";
import { ID, Query } from 'node-appwrite';
import { MemberRole } from "@/features/members/type";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { Workspace } from '../types';
import { z } from "zod";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";



const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {                     // Endpoint para obtener todos los workspaces
    
    const  user = c.get("user")                                   // Se obtiene el user del contexto (establecido en el middleware)
    const databases = c.get("databases")                         
    
    const members = await databases.listDocuments(                // Se obtienen los members cuyo userId coincida con el user logueado
      DATABASE_ID,                                                // En appWrite por cada workspace se crea un member, aunque sea el mismo user
      MEMBERS_ID,
      [Query.equal("userId", user.$id)],                         
    );

    if(members.total === 0){
      return c.json({ data: {documents:[], total: 0 }})
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId)  // Se obtienen los IDs de los workspaces asociados al usuario logueado
    
    const workspaces = await databases.listDocuments(             // Con esos IDs se obtienen los workspaces
      DATABASE_ID,
      WORKSPACE_ID,
      [
        Query.orderDesc("$createdAt"),                            // ordenados por fecha de creación
        Query.contains("$id", workspaceIds),                        
      ]
    );
    
    return c.json({ data: workspaces })
  })
  .get(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );

      return c.json({ data: workspace });
    }
  )
  .get(
    "/:workspaceId/info",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId
      );

      return c.json({ 
        data: {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
      }});
    }
  )
  .post(                                                           // Endpoint para crear un nuevo workspace
    "/",
    zValidator("form", createWorkspaceSchema),                     // Se carga el eschema de validación de workspace
    sessionMiddleware,                                             // Solo usuarios autenticados pueden acceder a esta ruta, ademas establece el contexto de la sesión
    async (c) => {
      const databases = c.get("databases")                         // Obtiene el databases del contexto (establecido en el middleware)
      const user = c.get("user")                                   // Obtiene el user del contexto (establecido en el middleware)

      const { name, image } = c.req.valid("form")                  // Se valida el request (nombre del workspace y la imagen) segun su esquema
      
      let uploadedImageUrl: string | undefined;                    // Definimos una variable que almacenará la URL de la imagen subida
      const storage = c.get("storage")                             // Se obtiene el storage del contexto (establecido en el middleware)

      if(image instanceof File) {                                  // Si la imagen es un objeto File
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

      const workspace = await databases.createDocument(            // Se crea el workspace en la base de datos
        DATABASE_ID,
        WORKSPACE_ID,
        ID.unique(),
        {
          name,                                                   // y se almacena el nombre del workspace
          userId: user.$id,                                       // y el ID del user que lo creó
          imageUrl: uploadedImageUrl,                             // y la URL de la imagen subida (avatar)
          inviteCode: generateInviteCode(6),                      // y un código de invitación aleatorio
        }
      );

      await databases.createDocument(                             // Cada vez que se crea un workspace se crea un member
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,                                       // y estará asociado al usuario que creó el workspace,
          workspaceId: workspace.$id,                             // al workspace que creó,
          role: MemberRole.ADMIN,                                 // y será un admin
        }
      )

      return c.json({ data: workspace })
    }
  )
  .patch(
    "/:workspaceId",                              // param
    sessionMiddleware,                            // usuario autenticado
    zValidator("form", updateWorkspaceSchema),    // info del formulario validado segun su esquema
    async (c) => {
      const databases = c.get("databases")
      const storage = c.get("storage")
      const user = c.get("user")

      const { workspaceId } = c.req.param()
      const  { name, image } = c.req.valid("form")

      const member = await getMember({ databases, workspaceId, userId: user.$id }) // Obtenemos el miembro del workspace
    
      if(!member || member.role !== MemberRole.ADMIN){
        return c.json({ error: "You are not authorized to perform this action" }, 401) // Validamos que el miembro del workspace sea admin para poder actualizar el workspace
      }

      let uploadedImageUrl: string | undefined;                    // Definimos una variable que almacenará la URL de la imagen subida

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
      } else {
        uploadedImageUrl = image                                   // Si la imagen no es un objeto File se almacena como string
      }
      
      const workspace = await databases.updateDocument(             // Se actualiza el workspace en la base de datos
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          name,                                                   // y se almacena el nombre del workspace
          imageUrl: uploadedImageUrl,                             // y la URL de la imagen subida (avatar)
        }
      );

      return c.json({ data: workspace })
    }
  )
  .delete(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases")
      const user = c.get("user")
      const { workspaceId } = c.req.param()

      const member = await getMember({                             // Obtiene el miembro del workspace
        databases,
        workspaceId,
        userId: user.$id,
      })
      if(!member || member.role !== MemberRole.ADMIN){
        return c.json({ error: "You are not authorized to perform this action" }, 401) // Validamos que el miembro del workspace sea admin para poder actualizar el workspace
      }

      // TODO: Delete members, projects and tasks

      await databases.deleteDocument(                               // Se elimina el workspace en la base de datos
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
      );

      return c.json({ data: { $id: workspaceId } })
    }
  )
  .post(
    "/:workspaceId/reset-invite-code",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases")
      const user = c.get("user")
      const { workspaceId } = c.req.param()

      const member = await getMember({                             // Obtiene el miembro del workspace
        databases,
        workspaceId,
        userId: user.$id,
      })
      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "You are not authorized to perform this action" }, 401) // Validamos que el miembro del workspace sea admin para poder actualizar el workspace
      }

      const workspace =await databases.updateDocument(              // Se actualiza el workspace en la base de datos
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(6),                        // con nuevo un nuevo código de invitación
        }
      );

      return c.json({ data: workspace  })
    }
  )
  .post(
    "/:workspaceId/join",                                         // Endpoint para unirse a un workspace
    sessionMiddleware,                                            // Solo usuarios autenticados pueden acceder a esta ruta, ademas establece el contexto de la sesión   
    zValidator("json", z.object({ code: z.string()})),            // Se valida que el code sea un string
    async (c) => {
      const { workspaceId } = c.req.param();                      // Se obtiene el workspaceId de los params (url)
      const { code } = c.req.valid("json");                       // También el code (desde el body de la solicitud)
      const databases = c.get("databases");                       // Se obtiene la base de datos
      const user = c.get("user");

      const member = await getMember({                            // Se comprueba si el usuario ya es miembro del workspace  
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(member){
        return c.json({ error: "You are already a member of this workspace" }, 400) 
      }

      const workspace = await databases.getDocument<Workspace>(   // Si el usuario no es miembro del workspace se obtiene el workspace
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
      )

      if(workspace.inviteCode !== code){                          // validamos que el código del body sea igual al código del workspace
        return c.json({ error: "Invalid invite code" }, 400)
      }

      await databases.createDocument(                             // Si el usuario no es miembro y code es correcto se crea un miembro dentro de la tabla de member
        DATABASE_ID,  
        MEMBERS_ID, 
        ID.unique(), 
        {
          userId: user.$id, 
          workspaceId: workspace.$id, 
          role: MemberRole.MEMBER, 
        }
      )

      return c.json({ data: workspace })
                  
    }
  )
  .get(
      "/:workspaceId/analytics",
      sessionMiddleware,
      async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { workspaceId } = c.req.param()
  
        const member = await getMember({
          databases,
          workspaceId,
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
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
          ],
        );
  
        const lastMonthTasks = await databases.listDocuments(                       // Obtenemos las tareas del mes anterior
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
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
            Query.equal("workspaceId", workspaceId),                                // para el proyecto especificado
            Query.equal("assigneeId", member.$id),                                  // que tengan un usuario asignado igual al usuario logueado (member del workspace)
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
          ],
        );
  
        const lastMonthAssignedTasks = await databases.listDocuments(               // Obtenemos las tareas assignadas del mes pasado
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
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
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
            Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
          ],
        );
  
        const lastMonthIncompleteTasks = await databases.listDocuments(             // Obtenemos las tareas incompletas del mes pasado
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
            Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes passado
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes pasado
          ],
        );
  
        const incompleteTaskCount = thisMonthIncompleteTasks.total;                 // Número de tareas incompletas del mes actual
        const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;  // Diferencia de tareas incompletas entre el mes actual y el anterior
      
        const thisMonthCompletedTasks = await databases.listDocuments(              // Obtenemos las tareas incompletas del mes actual
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
            Query.equal("status", TaskStatus.DONE),                                 // que tengan un estado igual a "DONE"
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
          ],
        );
  
        const lastMonthCompletedTasks = await databases.listDocuments(              // Obtenemos las tareas completas del mes pasado
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
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
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
            Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
            Query.lessThan("dueDate", now.toISOString()),                           // que tengan una fecha de vencimiento menor o igual a la fecha actual
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),     // que tengan una fecha de creación mayor o igual a la fecha del comienzo del mes actual
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),          // y que tengan una fecha de creación menor o igual a la fecha del final del mes actual
          ],
        );
  
        const lastMonthOverdueTasks = await databases.listDocuments(                // Obtenemos las tareas no vencidas del mes pasado
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("workspaceId", workspaceId),                                // para el workspace especificado
            Query.notEqual("status", TaskStatus.DONE),                              // que tengan un estado diferente a "DONE"
            Query.lessThan("dueDate", now.toISOString()),                           // que tengan una fecha de vencimiento menor o igual a la fecha actual
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


export default app;