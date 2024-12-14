import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";


interface UseGetProjectAnalyticsProps {
  projectId: string;
}

export const useGetProjectAnalytics = ({ projectId }: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      const response = await client.api.projects[":projectId"]["analytics"].$get({
        param: { projectId }
      })

      if (!response.ok) {           
        throw new Error("Failed to fetch projecta analytics");
      }

      const { data } = await response.json()
      return data
    }
  })

  return query
}