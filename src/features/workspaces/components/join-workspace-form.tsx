"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJoinWorkspace } from '../api/use-join-workspace';
import DottedSeparator from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useInviteCode } from "../hook/use-invite-code";
import { useWorkspaceId } from "../hook/use-workspace-id";
import { useRouter } from "next/navigation";


interface useJoinWorkspaceFormProps {
  initialValues: {
    name: string;
  }
}


export const JoinWorkspaceForm = ({ initialValues }: useJoinWorkspaceFormProps) => {
  
  const router = useRouter()
  const workspaceId = useWorkspaceId()
  const inviteCode = useInviteCode()
  const { mutate, isPending } = useJoinWorkspace();
  
  const onSubmit = () => {
    mutate({
      param: { workspaceId },
      json: { code: inviteCode },
    },{
      onSuccess: ({ data }) => {
        router.push(`/workspaces/${data.$id}`)
      }
    })
  }
  
  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">
          Join Workspace
        </CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <Button
            variant="secondary"
            asChild
            type="button"
            size="lg"
            disabled={isPending}
            className="w-full lg:w-fit"
          >
            <Link href="/">
              Cancel
            </Link>
          </Button>
          <Button
            size="lg"
            className="w-full lg:w-fit"
            type="button"
            onClick={onSubmit}
            disabled={isPending}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>

  )
}