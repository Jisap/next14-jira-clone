import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["$patch"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["$patch"]>


export const useUpdateProject = () => {                 // Hook para manejar una mutación de creación de un project con tanstack
  
  //const router = useRouter()
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { form, param } ) => {                                                     // la función de la mutación toma el form como el RequestType
      const response = await client.api.projects[":projectId"]["$patch"]({ form, param });        // y realizará una llamada a client.api.projects[":projectId"]["$patch"]({ form, param }) (datos del formulario y el id del proyecto en la url)
      
      if (!response.ok) throw new Error("Failed to update project");

      return response.json()                                                // retorna el json de la respuesta    
    },
    onSuccess: ({ data }) => {
      toast.success("Project updated successfully");
      //router.refresh()
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to update project");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}