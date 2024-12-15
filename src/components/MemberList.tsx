import { SettingsIcon } from "lucide-react";
import { Button } from "./ui/button";
import DottedSeparator from "./dotted-separator";
import Link from "next/link";
import { useWorkspaceId } from "@/features/workspaces/hook/use-workspace-id";
import { Card, CardContent } from "./ui/card";
import { Member } from "@/features/members/type";
import { MemberAvatar } from "@/features/members/components/member-avatar";


interface MemberListProps {
  data: Member[];
  total: number
}

export const MemberList = ({ data, total }: MemberListProps) => {

  const workspaceId = useWorkspaceId();
 
  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">
            Members ({total})
          </p>
          <Button
            asChild
            variant="secondary"
            size="icon"
          >
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((member) => (
            <li key={member.$id}>
              
                <Card className="shadow-none rounded-lg overflow-hidden">
                  <CardContent className="p-3 flex flex-col items-center gap-x-2">
                    <MemberAvatar
                      name={member.name}
                      className="size-12"
                    />
                    <div className="flex flex-col items-center overflow-hidden">
                      <p className="text-lg font-medium line-clamp-1">
                        {member.name}
                      </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {member.email}
                    </p>
                    </div>
                  </CardContent>
                </Card>
              
            </li>
          ))}
          {/* Si el array data está vacío, no se renderizan elementos <li> para las tareas.
           En ese caso, el <li> con el texto "No tasks found" se convierte automáticamente en el primer y único <li> dentro del <ul>. 
           Entonces, gracias a first-of-type:block, este elemento se muestra. 
          */}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No members found
          </li>
        </ul>
      </div>
    </div>
  )
}