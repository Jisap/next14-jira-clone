import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;      // Tipos inferidos de la respuesta de la API con hono



export const useLogout = () => {   // Hook para manejar una mutación de logout de sesión con tanstack
  
  const queryClient = useQueryClient();
  
  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async() => {                                                // La función de la mutación no toma ningún argumento, sino que devuelve una promesa que se resuelve cuando se reciba la respuesta de la API
      const response = await client.api.auth.logout["$post"]();             // y realizará una llamada a client.api.auth.logout["$post"] 
      return response.json();                                               // retorna el json de la respuesta
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current"]});              // Invalida las consultas de usuario actual en la aplicación cuando se realiza una mutación de logout
    }                                                                       // Esto provoca que el useCurrent de la pagina de inicio se actualice y muestre el estado de autenticación actualizado
  })

  return mutation; // retorna directamente el objeto mutation, el cual contiene propiedades útiles de react-query como isLoading, isError, data, etc., para manejar el estado de la mutación en el componente.
}