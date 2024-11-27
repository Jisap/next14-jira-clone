

import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card"
import { redirect } from "next/navigation";

const SignUpPage = async() => {

  const user = await getCurrent();
  if (user) redirect("/")

  return (
    <SignUpCard />
  )
}

export default SignUpPage