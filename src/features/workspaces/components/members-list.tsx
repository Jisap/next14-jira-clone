"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspaceId } from "../hook/use-workspace-id"
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import DottedSeparator from "@/components/dotted-separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Fragment } from "react";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";



export const MembersList = () => {

  const workspaceId = useWorkspaceId();
  const { data } = useGetMembers({ workspaceId });

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
        <CardTitle className="text-xl font-bold">
          Members List
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {data?.documents.map((member, index) => (
          <Fragment>
            <div className="flex items-center gap-2">
              <MemberAvatar  
                name={member.name} 
                className="size-10" 
                fallBackClassName="text-lg" 
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="ml-auto"
                    variant="secondary"
                    size="icon"  
                  >
                    <MoreVerticalIcon className="size-4 text-muted-foreground"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem 
                    className="font-medium"
                    onClick={() => {}}
                    disabled={false}
                  >
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() => { }}
                    disabled={false}
                  >
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium text-amber-700"
                    onClick={() => { }}
                    disabled={false}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data.documents.length - 1 && ( <Separator className="my-2.5"/>)}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}