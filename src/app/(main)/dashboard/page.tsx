import db from "@/lib/supabase/db"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import DashBoardSetup from "@/components/dashboard-setup/dashboard-setup"
import { getUserSubscriptionStatus } from "@/lib/supabase/queries"

const DashBoardPage = async () => {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
  })

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id)
  if (subscriptionError) return

  if (!workspace)
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <DashBoardSetup
          user={user}
          subscription={subscription}
        ></DashBoardSetup>
      </div>
    )

  redirect(`dashboard/${workspace.id}`)
}

export default DashBoardPage
