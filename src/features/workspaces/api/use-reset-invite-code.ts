import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
//import { useRouter } from "next/navigation";



type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]>


export const useResetInviteCode = () => {                 // Hook para manejar una mutación de regeneración de un código de invite a un workspace con tanstack
  
  //const router = useRouter()
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { param } ) => {                                                                       // la función de la mutación toma el param (workspaceId) como el RequestType
      const response = await client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]({ param });  // y realizará una llamada a cclient.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]({ param }) 
      
      if (!response.ok) throw new Error("Failed to reset invite code");

      return response.json()                                                                   // retorna el json de la respuesta (workspace con el invite-code regenerado) 
    },
    onSuccess: ({ data }) => {
      toast.success("Invite code reset");
      //router.refresh()
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id]});
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to reset invite code");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}