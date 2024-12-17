import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { Member, MemberRole } from "../type";



const app = new Hono()
  .get(                                                     // Endpoint para obtener todos los miembros del workspace
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

      const members = await databases.listDocuments<Member>( // Si el user que hace la petición es member se obtienen los miembros del workspace
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)],          
      );

      const populatedMembers = await Promise.all(           // A cada registro de member se le agrega su usuario
        members.documents.map(async (member) => {           // Se mapea members y de cada member se obtiene su user
          const user = await users.get(member.userId)       
          return {
            ...member,                                      // Se retorna el member con su user
            name: user.name || user.email,                  
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
  .delete(                                                            // Endpoint para eliminar un miembro del workspace
    "/:memberId",
    sessionMiddleware,
    async (c) => {
      const { memberId } = c.req.param();
      const user = c.get("user");
      const databases = c.get("databases");

      const memberToDelete = await databases.getDocument(              // Se obtiene los datos del miembro a eliminar
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      )

      const allMembersInWorkspace = await databases.listDocuments(     // Se obtienen todos los miembros del workspace asociado al miembro a eliminar
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToDelete.workspaceId)],
      )

      const member = await getMember({                                 // Se comprueba si el usuario que hace la petición es el miembro del workspace
        databases,
        workspaceId: memberToDelete.workspaceId,
        userId: user.$id,
      })

      if(!member){                                                     // Si no es miembro del workspace se retorna error
        return c.json({error: "Unauthorized"}, 401)
      }

      if(member.id !== memberToDelete.$id && member.role !== MemberRole.ADMIN){ // Si el usuario que hace la petición no es el miembro que se intenta eliminar y no es admin se retorna error
        return c.json({error: "Unauthorized"}, 401)
      }

      if(allMembersInWorkspace.total === 1){                           // Si el workspace solo tiene un miembro se retorna error
        return c.json({error: "Cannot delete the only member"}, 400)
      }

      await databases.deleteDocument(                                  // Si las validaciones son exisosas se elimina el miembro 
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      );

      return c.json({ data: { $id: memberToDelete.$id } })             // Retorna un objeto con el id del miembro eliminado.
    }
  )
  .patch(                                                              // Endpoint para actualizar el role de un miembro del workspace
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

      const memberToUpdate = await databases.getDocument(               // Se obtiene los datos del miembro a actualizar
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      )

      const allMembersInWorkspace = await databases.listDocuments(      // Se obtienen todos los miembros del workspace asociado al miembro a actualizar
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)],
      )

      const member = await getMember({                                  // Se comprueba si el usuario que hace la petición es el miembro del workspace
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      })

      if (!member) {                                                    // Si no es miembro del workspace se retorna error
        return c.json({ error: "Unauthorized" }, 401)
      }

      if (member.role !== MemberRole.ADMIN) {                           // Si el usuario que hace la petición no es admin se retorna error
        return c.json({ error: "Unauthorized" }, 401)
      }

      if (allMembersInWorkspace.total === 1) {                          // Si el workspace solo tiene un miembro se retorna error
        return c.json({ error: "Cannot downgrade the only member" }, 400)
      }

      await databases.updateDocument(                                   // Si las validaciones son exisosas se actualiza el miembro 
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
        {
          role 
        }
      );

      return c.json({ data: { $id: memberToUpdate.$id } })              // Retorna un objeto con el id del miembro actualizado.
    }
  )

export default app;