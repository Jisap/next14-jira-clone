

import { redirect } from 'next/navigation';
import { getCurrent } from '@/features/auth/actions';
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form';



const Home = async() => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in")

  

  return (
    <div className="bg-neutral-500 p-4 h-full">
      <CreateWorkspaceForm />
    </div>
  );
}

export default Home;