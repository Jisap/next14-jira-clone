import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
//import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>


export const useDeleteTask = () => {                 // Hook para manejar una mutación de borrado de un task con tanstack
  
  //const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { param } ) => {                                         // la función de la mutación toma el form como el RequestType
      const response = await client.api.tasks[":taskId"]["$delete"]({ param }); // y realizará una llamada a client.api.tasks[":taskId"]["$delete"] 
      
      if (!response.ok) throw new Error("Failed to delete task");

      return response.json()                                                    // retorna el json de la respuesta    
    },
    onSuccess: ({ data }) => {
      toast.success("Task deleted successfully");
      //router.refresh()
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", data.$id] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to delete task");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}