"use client"


import { Loader } from "lucide-react"

// No need
const LoadingPage = () => {
  return (
    <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export default LoadingPage