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
import AppUser from "./app-user"

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
        "hidden w-[300px] shirnk-0 p-4 md:gap-4 sm:flex sm:flex-col",
        className
      )}
    >
      <ScrollArea className="mr-[-18px] pr-[20px]">
        <div className="flex flex-col justify-between min-h-[calc(100vh-32px)]">
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
          <div>
            <NativeNavigation myWorkspace={params.workspaceId} />
            <AppUser />
            <div className="w-full h-[50px] sm:h-0"></div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}

export default Sidebar
