import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { MemberRole } from "../type";



const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient()           // Usuarios de appwrite
      const databases = c.get("databases")                  // Base de datos de appwrite
      const user = c.get("user")                            // Usuario logueado
      const { workspaceId } = c.req.valid("query")          // ID del workspace validado
    
      const member = await getMember({                      // Se comprueba si el usuario ya es miembro del workspace
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401)
      }

      const members = await databases.listDocuments(        // Si el user que hace la petición es member se obtienen los miembros del workspace
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)],          
      );

      const populatedMembers = await Promise.all(           // A cada registro de member se le agrega su usuario
        members.documents.map(async (member) => {           // Se mapea members y de cada member se obtiene su user
          const user = await users.get(member.userId)       
          return {
            ...member,                                      // Se retorna el member con su user
            name: user.name,
            email: user.email,
          }                          
        })
      )

      return c.json({
        data: {
          ...members,                                       // data contendrá los miembros del workspace
          documents: populatedMembers,                      // y los members con sus usuarios
        }
      })
    }
  )
  .delete(
    "/:memberId",
    sessionMiddleware,
    async (c) => {
      const { memberId } = c.req.param();
      const user = c.get("user");
      const databases = c.get("databases");

      const memberToDelete = await databases.getDocument(             // Se obtiene los datos del miembro a eliminar
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      )

      const allMembersInWorkspace = await databases.listDocuments(    // Se obtienen todos los miembros del workspace asociado al miembro a eliminar
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToDelete.workspaceId)],
      )

      const member = await getMember({                                // Se comprueba si el usuario que hace la petición es el miembro del workspace
        databases,
        workspaceId: memberToDelete.workspaceId,
        userId: user.$id,
      })

      if(!member){                                                    // Si no es miembro del workspace se retorna error
        return c.json({error: "Unauthorized"}, 401)
      }

      if(member.id !== memberToDelete.$id && member.role !== MemberRole.ADMIN){ // Si es usuario que hace la petición no es el miembro que se intenta eliminar y no es admin se retorna error
        return c.json({error: "Unauthorized"}, 401)
      }

      await databases.deleteDocument(                                 // Si las validaciones son existosas se elimina el miembro del 
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      );

      return c.json({ data: { $id: memberId } })                      // Retorna un objeto con el id del miembro eliminado.
    }
  )

export default app;