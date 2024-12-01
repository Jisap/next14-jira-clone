import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID } from "@/config";


interface GetMemberProps{
  databases: Databases;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({ databases, workspaceId, userId }: GetMemberProps) => { // Busca si un usuario específico pertenece a un workspace en particular
  const members = await databases.listDocuments(
    DATABASE_ID,
    MEMBERS_ID,
    [
      Query.equal("workspaceId", workspaceId),
      Query.equal("userId", userId),
    ]
  );

  return members.documents[0] // Devuelve un usuario logueado que trata de acceder a un workspace
}