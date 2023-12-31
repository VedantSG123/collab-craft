import { useAppState } from "@/lib/providers/state-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import { AccordionItem, AccordionTrigger } from "../ui/accordion"
import clsx from "clsx"
import EmojiPicker from "../global/emoji-picker"
import { EmojiClickData } from "emoji-picker-react"
import { updateFolder } from "@/lib/supabase/queries"
import { useToast } from "../ui/use-toast"
import ToolTipComponent from "../global/tooltip-component"
import { Plus, Trash } from "lucide-react"

type DropdownProps = {
  title: string
  id: string
  listType: "folder" | "file"
  iconId: string
  children?: React.ReactNode
  disabled?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
  ...props
}) => {
  const supabase = createClientComponentClient()
  const { state, dispatch, workspaceId, folderId } = useAppState()

  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  //folder title
  const folderTitle: string | undefined = useMemo(() => {
    if (listType === "folder") {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title

      if (title === stateTitle || !stateTitle) return title
      return stateTitle
    }
  }, [state, listType, workspaceId, id, title])

  //file title
  const fileTitle: string | undefined = useMemo(() => {
    if (listType === "file") {
      const fileAndFolderId = id.split("folder")
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title

      if (title === stateTitle || !stateTitle) return title
      return stateTitle
    }
  }, [state, listType, workspaceId, id, title])
  //Navigate to different page
  //add a title

  //double click to renam
  //blur

  //onchanges
  const onEmojiChange = async (emojiData: EmojiClickData) => {
    if (!workspaceId) return
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId: workspaceId,
          folderId: id,
          folderData: {
            iconId: emojiData.emoji,
          },
        },
      })

      const { error } = await updateFolder({ iconId: emojiData.emoji }, id)
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to update emoji for this folder",
        })
      } else {
        toast({
          title: "Success",
          description: "Updated emoji for this folder successfully",
        })
      }
    }
  }

  const folderTitleChange = (e: any) => {
    if (!workspaceId) return
    const fid = id.split("folder")
    if (fid.length === 1) {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: fid[0],
          folderData: {
            title: e.target.value,
          },
        },
      })
    }
  }
  const fileTitleChange = (e: any) => {
    if (!workspaceId) return
    const fid = id.split("folder")
    if (fid.length === 2 && fid[1]) {
      //todo: file change dispatch
    }
  }

  //double click
  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  //blur
  const handleBlur = async () => {
    setIsEditing(false)
    const fId = id.split("folder")
    if (fId.length === 1) {
      if (!folderTitle) return
      await updateFolder({ title }, fId[0])
    }

    if (fId.length === 2) {
      if (!fileTitle) return
      //TODO: Update the file
    }
  }

  const isFolder = listType === "folder"

  const navigatePage = (accordianId: string, type: string) => {
    if (type === "folder") {
      router.push(`/dashboard/${workspaceId}/${accordianId}`)
    }

    if (type === "file") {
      router.push(`dashboard/${workspaceId}/${folderId}/${accordianId}`)
    }
  }

  const groupIdentifies = useMemo(
    () =>
      clsx(
        "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative",
        {
          "group/folder": isFolder,
          "group/file": !isFolder,
        }
      ),
    [isFolder]
  )

  const listStyles = useMemo(
    () =>
      clsx("relative", {
        "border-none text-md": isFolder,
        "border-none ml-6 text-[16px] py-1": !isFolder,
      }),
    [isFolder]
  )

  const hoverStyles = useMemo(
    () =>
      clsx(
        "h-full hidden rounded-sm absolute right-0 items-center justify-center",
        {
          "group-hover/file:block": listType === "file",
          "group-hover/folder:block": listType === "folder",
        }
      ),
    [isFolder]
  )

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation()
        navigatePage(id, listType)
      }}
    >
      <AccordionTrigger
        id={listType}
        className="
        hover:no-underline
        p-2
        dark:text-muted-foreground
        text-sm
        "
        disabled={listType === "file"}
      >
        <div className={groupIdentifies}>
          <div
            className="
            flex
            gap-4
            items-center
            justify-center
            overflow-hidden
            "
          >
            <div className="relative">
              <EmojiPicker getValue={onEmojiChange}>{iconId}</EmojiPicker>
            </div>
            <input
              type="text"
              value={listType === "folder" ? folderTitle : fileTitle}
              className={clsx(
                "outline-none overflow-hidden w-[140px] text-neutral-600",
                {
                  "bg-muted cursor-text": isEditing,
                  "bg-transparent cursor-pointer": !isEditing,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={
                listType === "folder" ? folderTitleChange : fileTitleChange
              }
            />
          </div>
          <div className={hoverStyles}>
            <ToolTipComponent message="Move to trash">
              <Trash
                size={15}
                //onClick={}
                className="hover:dark:text-white dark:text-neutral-600 transition-colors"
              />
            </ToolTipComponent>
            {listType === "folder" && !isEditing && (
              <ToolTipComponent message="Add a file">
                <Plus
                  size={15}
                  //onClick={}
                  className="hover:dark:text-white dark:text-neutral-600 transition-colors"
                />
              </ToolTipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
    </AccordionItem>
  )
}

export default Dropdown
