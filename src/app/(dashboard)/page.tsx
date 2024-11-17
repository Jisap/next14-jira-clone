

import { redirect } from 'next/navigation';
import { getCurrent } from '@/features/auth/actions';
import { UserButton } from '../../features/auth/components/user-button';



const Home = async() => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in")

  

  return (
    <div className="flex gap-4">
      This is a home page
    </div>
  );
}

export default Home;