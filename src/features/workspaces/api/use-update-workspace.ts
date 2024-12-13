import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
//import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;  // Tipos inferidos de la respuesta de la API con hono. La respuesta devuelve data y un status que por defecto es success
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>          // La petición recoge el form y el param   


export const useUpdateWorkspace = () => {                 // Hook para manejar una mutación de actualizaciónde un workspace con tanstack
  
  //const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async( { form, param } ) => {                                                   // la función de la mutación toma el form como el RequestType
      const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form, param });  // y realizará una llamada a client.api.workspaces[":workspaceId"]["$patch"] 
      
      if (!response.ok) throw new Error("Failed to updated workspace");                         // Manejo del error de la respuesta si es que no es exitosa

      return response.json()                                                                    // retorna el json de la respuesta    
    },
    onSuccess: ({data}) => {
      toast.success("Workspace updated successfully");
      //router.refresh()
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to update workspace");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}