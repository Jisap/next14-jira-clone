
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

export async function signUpWithGithub() { // Action del lado del servidor en un entorno de Next.js que se utiliza para iniciar el proceso de autenticación con GitHub mediante OAuth2
  
  const { account } = await createAdminClient();         // Se invoca createAdminClient para obtener una instancia del cliente de Appwrite.

  const origin = headers().get("origin");                // obtiene el encabezado Origin de la solicitud HTTP (la URL base)

  const redirectUrl = await account.createOAuth2Token(   // createOAuth2Token es un método proporcionado por Appwrite que inicia el flujo de autenticación con OAuth2.
    OAuthProvider.Github,                                // El proveedor de autenticación es GitHub. (Cuadro de dialogo de GitHub)
    `${origin}/oauth`,                                   // URL de redirección en caso de éxito
    `${origin}/sign-up`,                                 // URL de redirección en caso de fallo o cancelación. 
  );

  return redirect(redirectUrl);                          // Redirecciona al usuario a la URL de redirección proporcionada por Appwrite -> allí se creará una sesión autenticada utilizando Appwrite y se configurará una cookie de autenticación segura. -> redirect a "/"
};


export async function signUpWithGoogle() { // Action del lado del servidor en un entorno de Next.js que se utiliza para iniciar el proceso de autenticación con Google mediante OAuth2

  const { account } = await createAdminClient();         // Se invoca createAdminClient para obtener una instancia del cliente de Appwrite.

  const origin = headers().get("origin");                // obtiene el encabezado Origin de la solicitud HTTP (la URL base)

  const redirectUrl = await account.createOAuth2Token(   // createOAuth2Token es un método proporcionado por Appwrite que inicia el flujo de autenticación con OAuth2.
    OAuthProvider.Google,                                // El proveedor de autenticación es Google. (Cuadro de dialogo de Google)
    `${origin}/oauth`,                                   // URL de redirección en caso de éxito
    `${origin}/sign-up`,                                 // URL de redirección en caso de fallo o cancelación. 
  );

  return redirect(redirectUrl);                          // Redirecciona al usuario a la URL de redirección proporcionada por Appwrite -> allí se creará una sesión autenticada utilizando Appwrite y se configurará una cookie de autenticación segura. -> redirect a "/"
};
