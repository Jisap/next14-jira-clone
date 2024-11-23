

import { redirect } from 'next/navigation';
import { getCurrent } from '@/features/auth/actions';
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form';



const Home = async() => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in")

  return (
    <div className="">
      home page
    </div>
  );
}

export default Home;