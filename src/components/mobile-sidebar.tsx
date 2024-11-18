"use client"

import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MobileSidebar = () => {

  const [isOpen, setIsOpen] = useState(false); // Sera controlado por SheetTrigger
  const pathname = usePathname();

  useEffect(( ) => {
    setIsOpen(false)
  },[pathname])

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="lg:hidden" // Solo se muestra en tamaños inferiores a lg
        >
          <MenuIcon className="size-4 text-neutral-500"/>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar;