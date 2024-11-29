"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJoinWorkspace } from '../api/use-join-workspace';

interface useJoinWorkspaceFormProps {
  initialValues: {
    name: string;
  }
}


export const JoinWorkspaceForm = ({ initialValues }: useJoinWorkspaceFormProps) => {
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
      <div>
        
      </div>
    </Card>

  )
}