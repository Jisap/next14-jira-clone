import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";

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

      const projects = await databases.listDocuments(       // Si el usuario logueado es un miembro del workspace, devuelve todos los proyectos del workspace
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

export default app