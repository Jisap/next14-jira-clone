import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.tasks["$post"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.tasks["$post"]>


export const useCreateTask = () => {                 // Hook para manejar una mutación de creación de un task con tanstack
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { json } ) => {                                      // la función de la mutación toma el form como el RequestType
      const response = await client.api.tasks["$post"]({ json });           // y realizará una llamada a client.api.tasks["$post"] 
      
      if (!response.ok) throw new Error("Failed to create task");

      return response.json()                                                // retorna el json de la respuesta    
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to create task");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}