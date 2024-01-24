import { useAppState } from "@/lib/providers/state-provider"
import { usePathname, useRouter } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import clsx from "clsx"
import EmojiPicker from "../global/emoji-picker"
import { EmojiClickData } from "emoji-picker-react"
import { createFile, updateFile, updateFolder } from "@/lib/supabase/queries"
import { useToast } from "../ui/use-toast"
import ToolTipComponent from "../global/tooltip-component"
import { Plus, Trash } from "lucide-react"
import { File } from "@/lib/supabase/supabase.types"
import { v4 } from "uuid"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"

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
  const { state, dispatch, workspaceId, folderId } = useAppState()
  const { user } = useSupabaseUser()
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const path = usePathname()
  const { toast } = useToast()
  const [active, setActive] = useState("")

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
    if (!workspaceId || !folderId) return
    const fid = id.split("folder")
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          workspaceId,
          folderId,
          fileId: fid[1],
          fileData: { title: e.target.value },
        },
      })
    }
  }

  //double click
  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  //blur
  const handleBlur = async () => {
    if (!isEditing) return
    setIsEditing(false)
    const fId = id.split("folder")
    if (fId.length === 1) {
      if (!folderTitle) return
      const { error } = await updateFolder({ title }, fId[0])
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to change the title of the folder",
        })
      } else {
        toast({
          title: "Success",
          description: "Folder title changed",
        })
      }
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return
      const { error } = await updateFile({ title: fileTitle }, fId[1])
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to change the title of the file",
        })
      } else {
        toast({
          title: "Success",
          description: "File title changed",
        })
      }
    }
  }

  const isFolder = listType === "folder"

  const createNewFile = async () => {
    if (!workspaceId) return
    const newFile: File = {
      folderId: id,
      title: "Untitled",
      iconId: "📄",
      id: v4(),
      data: null,
      workspaceId: workspaceId,
      inTrash: null,
      bannerUrl: "",
      createdAt: new Date().toISOString(),
    }

    dispatch({
      type: "ADD_FILE",
      payload: {
        workspaceId,
        folderId: id,
        file: newFile,
      },
    })

    const { error } = await createFile(newFile)
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to create a new file",
      })
    } else {
      toast({
        title: "Success",
        description: "Create new file successfully",
      })
    }
  }

  const moveToTrash = async (e: any) => {
    e.stopPropagation()
    if (!workspaceId || !user?.email) return
    const pathId = id.split("folder")
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          workspaceId,
          folderId: pathId[0],
          folderData: { inTrash: `Deleted by ${user.email}` },
        },
      })

      const { error } = await updateFolder(
        { inTrash: `Deleted by ${user.email}` },
        pathId[0]
      )
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to move the folder to trash",
        })
      } else {
        toast({
          title: "Success",
          description: "Folder moved to trash",
        })
      }
    }

    if (listType === "file") {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          workspaceId,
          folderId: pathId[0],
          fileData: { inTrash: `Deleted by ${user.email}` },
          fileId: pathId[1],
        },
      })

      const { error } = await updateFile(
        { inTrash: `Deleted by ${user.email}` },
        pathId[1]
      )
      if (error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to move the file to trash",
        })
      } else {
        toast({
          title: "Success",
          description: "File moved to trash",
        })
      }
    }
  }

  const navigatePage = (accordianId: string, type: string) => {
    if (type === "folder") {
      router.push(`/dashboard/${workspaceId}/${accordianId}`)
    }

    if (type === "file") {
      const splitIds = accordianId.split("folder")
      router.push(`/dashboard/${workspaceId}/${splitIds[0]}/${splitIds[1]}`)
    }
  }

  useEffect(() => {
    if (!path || !state.workspaces || !workspaceId || !folderId) return
    const segments = path
      .split("/")
      .filter((value) => value !== "dashboard" && value)

    if (segments.length === 2) {
      setActive(segments[1])
    }

    if (segments.length === 3) {
      setActive(`${segments[1]}folder${segments[2]}`)
    }
  }, [path])

  const groupIdentifies = useMemo(
    () =>
      clsx(
        "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative py-1",
        {
          "group/folder rounded-l-sm": isFolder,
          "group/file rounded-sm": !isFolder,
          "bg-primary/30 dark:bg-primary-foreground/70 dark:text-white":
            active === id,
        }
      ),
    [isFolder, active]
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
        "h-full hidden rounded-sm absolute right-0 items-center justify-center py-1 pr-1",
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
        className={clsx(
          "hover:no-underline p-2 dark:text-muted-foreground text-sm relative",
          {
            "bg-primary/30 dark:bg-primary-foreground/50 rounded-r-sm":
              active === id && listType === "folder",
          }
        )}
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
            <ToolTipComponent message="Move to trash relative">
              <Trash
                size={15}
                onClick={moveToTrash}
                className="hover:dark:text-white dark:text-neutral-600 transition-colors relative z-40"
              />
            </ToolTipComponent>
            {listType === "folder" && !isEditing && (
              <ToolTipComponent message="Add a file">
                <Plus
                  size={15}
                  onClick={createNewFile}
                  className="hover:dark:text-white dark:text-neutral-600 transition-colors relative z-40"
                />
              </ToolTipComponent>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {state.workspaces
          .find((workspace) => workspace.id === workspaceId)
          ?.folders.find((folder) => folder.id === id)
          ?.files.filter((file) => !file.inTrash)
          .map((file) => {
            const customFileId = `${id}folder${file.id}`
            return (
              <Dropdown
                key={file.id}
                title={file.title}
                listType="file"
                id={customFileId}
                iconId={file.iconId}
              />
            )
          })}
      </AccordionContent>
    </AccordionItem>
  )
}

export default Dropdown
