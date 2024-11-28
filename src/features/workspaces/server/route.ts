import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { ID, Query, Databases } from 'node-appwrite';
import workspaces from '@/features/workspaces/server/route';
import { MemberRole } from "@/features/members/type";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { Workspace } from '../types';



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
          role: MemberRole.ADMIN,                                          // y será un admin
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

      const workspace =await databases.updateDocument(              // Se elimina el workspace en la base de datos
        DATABASE_ID,
        WORKSPACE_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(6),                        // se genera un nuevo código de invitación
        }
      );

      return c.json({ data: workspace  })
    }
  )


export default app;