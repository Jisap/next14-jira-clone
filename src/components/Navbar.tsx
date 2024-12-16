"use client"

import { UserButton } from "@/features/auth/components/user-button"
import MobileSidebar from "./mobile-sidebar"
import { usePathname } from "next/navigation"

const pathnameMap = {
  "tasks": {
    title: "My Tasks",
    description: "View all of your taks here",
  },
  "projects": {
    title: "My Projects",
    description: "View task of your projects here",
  },
}

const defaultMap = {
  title: "Home",
  description: "Monitor all your projects and taks here",
}


export const Navbar = () => {

  const pathname = usePathname();                                        // Obtiene la ruta actual
  const pathnameParts = pathname.split("/");                             // Divide la ruta en partes
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;      // Obtiene la clave de la ruta ["", "workspace", "12345", "project", "67890"]
  const { title, description } = pathnameMap[pathnameKey] || defaultMap; // Obtiene los títulos y descripciones de la ruta

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <UserButton />
    </nav>
  )
}