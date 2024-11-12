import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!); 

// rpc (define) -> client (basado en) -> hc: hono client type (hc se basa en /api/[[...route]]) -> y este maneja las rutas de la aplicación basado en las ruta del /features/server

// client -> /api/[[...route]] -> /features/server

// client -> .route("/auth", auth) -> /login

// client -> api.auth -> .login