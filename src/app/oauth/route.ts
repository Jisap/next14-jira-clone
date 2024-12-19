

import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {                  // Handler para una ruta GET en Next.js (App Router), que se utiliza para crear una sesión autenticada utilizando Appwrite y configurar una cookie de autenticación segura.
  
  const userId = request.nextUrl.searchParams.get("userId");       // Extrae userId y secret de los parámetros. Estos valores son necesarios para autenticar al usuario.
  const secret = request.nextUrl.searchParams.get("secret");

  if(!userId || !secret) {
    return new NextResponse("Missing fields", { status: 400 });    // Si falta alguno de los campos, devuelve un error 400.
  }

  const { account } = await createAdminClient();                   // Crea una instancia del cliente de Appwrite.
  const session = await account.createSession(userId, secret);     // Autentica el usuario y devuelve una instancia de Session  que contiene información como el token de sesión y otros detalles.

  cookies().set(                                                   // Configura una cookie del lado del servidor  
    AUTH_COOKIE,                                                   // con el nombre de la cookie
    session.secret,                                                // y el valor de la cookie, que es el secreto de sesión de Appwrite. 
      {                      
        path: "/",                                                 // La cookie es válida en toda la aplicación. 
        httpOnly: true,                                            // La cookie no puede ser accedida por JavaScript en el cliente, lo que la hace más segura.
        sameSite: "strict",                                        // Previene que la cookie se envíe en solicitudes cruzadas, mejorando la seguridad contra ataques CSRF.
        secure: true,                                              // La cookie solo se enviará a través de conexiones HTTPS.
      }
  );

  return NextResponse.redirect(`${request.nextUrl.origin}/`);      // Redirige al usuario a la raíz del sitio web (/).
}
