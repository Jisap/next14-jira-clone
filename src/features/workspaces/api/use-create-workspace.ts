import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";


type ResponseType = InferResponseType<typeof client.api.workspaces["$post"]>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>


export const useCreateWorkspace = () => {                 // Hook para manejar una mutación de creación de un workspace con tanstack
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { json } ) => {                                      // la función de la mutación toma como json el RequestType
      const response = await client.api.workspaces["$post"]({ json });      // y realizará una llamada a client.api.workspaces["$post"] 
      return response.json()                                                // retorna el json de la respuesta    
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}