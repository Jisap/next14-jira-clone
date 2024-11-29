import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"]>


export const useJoinWorkspace = () => {                 // Hook para manejar una mutación creación de una membresía a un workspace con tanstack
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { param, json } ) => {                                                          // la función de la mutación toma el param (workspaceId) como el RequestType y el code como body tipo json
      const response = await client.api.workspaces[":workspaceId"]["join"]["$post"]({ param, json });  // y realizará una llamada a cclient.api.workspaces[":workspaceId"]["join"]["$post"]({ param, json }) 
      
      if (!response.ok) throw new Error("Failed to join workspace");

      return response.json()                                                                           // retorna el json de la respuesta (workspace con el invite-code regenerado) 
    },
    onSuccess: ({ data }) => {
      toast.success("Joined workspace");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id]});
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to join workspace");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}