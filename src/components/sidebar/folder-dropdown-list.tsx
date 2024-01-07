"use client"
import { useAppState } from "@/lib/providers/state-provider"
import { Folder } from "@/lib/supabase/supabase.types"
import React, { useEffect, useState } from "react"
import ToolTipComponent from "../global/tooltip-component"
import { Plus } from "lucide-react"
import { v4 } from "uuid"
import { createFolder } from "@/lib/supabase/queries"
import { useToast } from "../ui/use-toast"
import { Accordion } from "../ui/accordion"
import Dropdown from "./dropdown"
import useSupabaseRealtime from "@/lib/hooks/use-supabase-realtime"

type FolderDropDownListProps = {
  workspaceFolders: Folder[]
  workspaceId: string
}

const FolderDropDownList: React.FC<FolderDropDownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  //local state folders
  useSupabaseRealtime()
  const { state, dispatch, folderId } = useAppState()
  const [folders, setFolders] = useState(workspaceFolders)
  const { toast } = useToast()

  useEffect(() => {
    if (workspaceFolders.length >= 0) {
      dispatch({
        type: "SET_FOLDERS",
        payload: {
          workspaceId,
          folders: workspaceFolders.map((folder) => ({
            ...folder,
            files:
              state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((f) => f.id === folder.id)?.files || [],
          })),
        },
      })
    }
  }, [workspaceFolders, workspaceId])

  useEffect(() => {
    setFolders(
      state.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders || []
    )
  }, [state, workspaceId])

  const addFolderHandler = async () => {
    const newFolder: Folder = {
      data: null,
      id: v4(),
      createdAt: new Date().toISOString(),
      title: "Untitled",
      iconId: "📁",
      inTrash: null,
      workspaceId,
      bannerUrl: "",
    }
    dispatch({
      type: "ADD_FOLDER",
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    })

    const { error } = await createFolder(newFolder)
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to create the folder",
      })
    } else {
      toast({
        title: "Success",
        description: "Folder Created",
      })
    }
  }

  return (
    <>
      <div
        className="
      flex
      sticky
      z-20
      top-0
      bg-background
      w-full
      h-10
      group/title
      justify-between
      items-center
      text-Neutrals/neutrals-8
      "
      >
        <span
          className="
        dark:text-neutrals-8
        font-bold
        text-xs
        "
        >
          FOLDERS
        </span>
        <ToolTipComponent message="Create Folder">
          <Plus
            size={20}
            className="
            group-hover/title:inline-block
            hidden
            cursor-pointer
            hover:dark:text-primary
            "
            onClick={addFolderHandler}
          />
        </ToolTipComponent>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType="folder"
              id={folder.id}
              iconId={folder.iconId}
            />
          ))}
      </Accordion>
    </>
  )
}

export default FolderDropDownList
