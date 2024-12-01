import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.projects["$post"], 200>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.projects["$post"]>


export const useCreateProject = () => {                 // Hook para manejar una mutación de creación de un project con tanstack
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { form } ) => {                                      // la función de la mutación toma el form como el RequestType
      const response = await client.api.projects["$post"]({ form });        // y realizará una llamada a client.api.project["$post"] 
      
      if (!response.ok) throw new Error("Failed to create project");

      return response.json()                                                // retorna el json de la respuesta    
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to create project");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}