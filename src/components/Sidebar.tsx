import DottedSeparator from "@/components/dotted-separator"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "./Navigation"


export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/">
        <Image 
          src="/logo.svg"
          alt="logo"
          width={164}
          height={48}
        />
      </Link>
      <DottedSeparator className="my-4"/>
      <Navigation />

    </aside>
  )
}