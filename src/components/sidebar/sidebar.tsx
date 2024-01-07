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
import NativeNavigation from "./native-navigation"
import FolderDropDownList from "./folder-dropdown-list"
import { ScrollArea } from "../ui/scroll-area"

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
        "hidden sm:flex sm:flex-col w-[300px] shirnk-0 p-4 md:gap-4 !justify-betweem",
        className
      )}
    >
      <ScrollArea className="mr-[-18px] pr-[20px]">
        <div className="relative">
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
          <ScrollArea className="h-[450px] w-full relative">
            <div
              className="
              w-full
              absolute
              h-20
              bottom-0
              bg-gradient-to-t 
              from-background 
              to-transparent 
              z-40
              "
            ></div>
            <FolderDropDownList
              workspaceFolders={workspaceFolderData || []}
              workspaceId={params.workspaceId}
            />
          </ScrollArea>
        </div>
        <NativeNavigation myWorkspace={params.workspaceId} />
      </ScrollArea>
    </aside>
  )
}

export default Sidebar
