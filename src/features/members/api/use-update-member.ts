import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$patch"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$patch"]>


export const useUpdateMember = () => {                 // Hook para manejar una mutación de actualización del rol de un member con tanstack
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { param, json } ) => {                                                        // la función de la mutación toma el param (workspaceId) como el RequestType
      const response = await client.api.members[":memberId"]["$patch"]({ param, json });      // y realizará una llamada a client.api.workspaces[":workspaceId"]["$delete"]({ param }) 
      
      if (!response.ok) throw new Error("Failed to update member");

      return response.json()                                                                   // retorna el json de la respuesta (workspaceId borrado) 
    },
    onSuccess: () => {
      toast.success("Member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to update member");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}