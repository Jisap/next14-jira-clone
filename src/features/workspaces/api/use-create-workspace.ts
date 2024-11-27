import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.workspaces["$post"]>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>


export const useCreateWorkspace = () => {                 // Hook para manejar una mutación de creación de un workspace con tanstack
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { form } ) => {                                      // la función de la mutación toma el form como el RequestType
      const response = await client.api.workspaces["$post"]({ form });      // y realizará una llamada a client.api.workspaces["$post"] 
      
      if (!response.ok) throw new Error("Failed to create workspace");

      return response.json()                                                // retorna el json de la respuesta    
    },
    onSuccess: () => {
      toast.success("Workspace created successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to create workspace");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}