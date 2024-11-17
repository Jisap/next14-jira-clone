import Image from "next/image"
import Link from "next/link"


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
    </aside>
  )
}