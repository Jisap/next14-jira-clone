import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";



type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]>


export const useBulkUpdateTasks = () => {                 // Hook para manejar una mutación de actualización masiva de tasks con tanstack

  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { json } ) => {                                              // la función de la mutación toma el form como el RequestType
      const response = await client.api.tasks["bulk-update"]["$post"]({ json });    // y realizará una llamada a client.api.tasks["bulk-update"]["$post"] 
      
      if (!response.ok) throw new Error("Failed to update tasks");

      return response.json()                                                        // retorna el json de la respuesta    
    },
    onSuccess: () => {
      toast.success("Tasks updated successfully");
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to update tasks");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}