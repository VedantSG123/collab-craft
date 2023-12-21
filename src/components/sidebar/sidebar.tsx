import {
  getCollaboratingWorkspaces,
  getPrivateWorkspace,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { getFolders } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import { twMerge } from "tailwind-merge"

import WorkspaceDropdown from "./workspace-dropdown"

type SidebarPropos = {
  params: { workspaceId: string }
  className?: string
}

const Sidebar: React.FC<SidebarPropos> = async ({ params, className }) => {
  const supabase = createServerComponentClient({ cookies })

  //user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return
  //subscriptions
  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id)

  //folders
  const { data: workspaceFolderData, error: foldersError } = await getFolders(
    params.workspaceId
  )
  //error
  if (foldersError) redirect("/dashboard")

  //get all workspaces private collaborating shared
  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspace(user.id),
      getCollaboratingWorkspaces(user.id),
      getSharedWorkspaces(user.id),
    ])

  return (
    <aside
      className={twMerge(
        "hidden sm:flex sm:flex-col w-[280px] shirnk-0 p-4 md:gap-4 !justify-between",
        className
      )}
    >
      <div>
        <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find((workspace) => workspace.id === params.workspaceId)}
        />
      </div>
    </aside>
  )
}

export default Sidebar
