import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";


interface UseGetworkspaceInfoProps {
  workspaceId: string;
}

export const useGetWorkspaceInfo = ({ workspaceId }: UseGetworkspaceInfoProps) => {
  const query = useQuery({
    queryKey: ["workspace-info", workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"]["info"].$get({
        param: { workspaceId }
      })

      if (!response.ok) {           
        throw new Error("Failed to fetch workspace info");
      }

      const { data } = await response.json()
      return data
    }
  })

  return query
}