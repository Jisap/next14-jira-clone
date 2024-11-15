"use client"

import { Button } from "@/components/ui/button";
import { useCurrent } from "@/features/auth/api/use-current";
import { useLogout } from "@/features/auth/api/use-logout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserButton } from '../features/auth/components/user-button';




export default function Home() {

  const router = useRouter();
  const { data, isLoading  } = useCurrent();
  const { mutate } = useLogout();

  useEffect(() => {
    if(!data && !isLoading){
      router.push("/sign-in")
    }
  },[data])

  return (
    <div className="flex gap-4">
      <UserButton />
    </div>
  );
}
