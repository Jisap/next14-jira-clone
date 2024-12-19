import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
//import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>


export const useUpdateTask = () => {                 // Hook para manejar una mutación de actualización de un task con tanstack
  //const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { json, param } ) => {                                           // la función de la mutación toma el form como el RequestType
      const response = await client.api.tasks[":taskId"]["$patch"]({ json, param });    // y realizará una llamada a client.api.tasks[":taskId"]["$post"] 
      
      if (!response.ok) throw new Error("Failed to update task");

      return response.json()                                                            // retorna el json de la respuesta    
    },
    onSuccess: ({ data }) => {
      toast.success("Task updated successfully");
      //window.location.reload();
      //router.refresh()
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to update task");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}