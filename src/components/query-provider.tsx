'use client'


import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

function makeQueryClient() {  // Se crea un cliente de consulta QueryClient
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {                                           // Cuando se obtiene el cliente de consulta,
  if (isServer) {                                                     // si el código se ejecuta en el servidor,
    return makeQueryClient()                                          // se crea un cliente de consulta
  } else {                                                            // si el código se ejecuta en el navegador,                
     if (!browserQueryClient) browserQueryClient = makeQueryClient()  // si no existe un cliente de consulta, se crea uno
      return browserQueryClient                                       // pero si ya existe, se devuelve el cliente de consulta
  }
}

interface QueryProviderProps {
  children: React.ReactNode
}

export const QueryProvider = ({ children }: QueryProviderProps) => { // Se crea un componente Providers que provee un cliente de consulta para toda la aplicación
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}