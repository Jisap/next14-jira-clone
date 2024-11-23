import { getCurrent } from '@/features/auth/actions';
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form'
import { redirect } from 'next/navigation';
import React from 'react'

const page = async() => {

  const user = await getCurrent();
  if (!user) redirect("/sign-in")


  return (
    <CreateWorkspaceForm />
  )
}

export default page