import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>;  // Tipos inferidos de la respuesta de la API con hono
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>


export const useRegister = () => {   // Hook para manejar una mutación de inicio de sesión con tanstack
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {                                       // la función de la mutación toma como json el RequestType
      const response = await client.api.auth.register["$post"]({ json });   // y realizará una llamada a client.api.auth.login["$post"] 
      
      if(!response.ok) throw new Error("Failed to register");
      
      return response.json();                                               // retorna el json de la respuesta
    },
    onSuccess: () => {
      //window.location.reload()
      toast.success("Registered successfully");
      router.refresh()
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: (error) => {
      console.log({error});
      toast.error("Failed to register");
    }
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}