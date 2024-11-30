"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { useWorkspaceId } from "../hook/use-workspace-id"
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";




export const MembersList = () => {

  const workspaceId = useWorkspaceId();

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 sapce-y-0">
        <Button
          asChild
          variant="secondary"
          size="sm"
        >
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
      </CardHeader>
    </Card>
  )
}