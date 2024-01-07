"use client"
import { useAppState } from "@/lib/providers/state-provider"
import { File, Folder, workspace } from "@/lib/supabase/supabase.types"
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react"
import "quill/dist/quill.snow.css"
import { Button } from "../ui/button"
import {
  deleteFile,
  deleteFolder,
  findUser,
  getFileDetails,
  getFoldereDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/queries"
import { usePathname, useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import EmojiPicker from "../global/emoji-picker"
import { EmojiClickData } from "emoji-picker-react"
import BannerUpload from "../banner-upload/banner-upload"
import ToolTipComponent from "../global/tooltip-component"
import { ArrowUpFromLine, Minus } from "lucide-react"
import { useToast } from "../ui/use-toast"
import { useSocket } from "@/lib/providers/socket-provider"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import Quill from "quill"
import clsx from "clsx"

type QuillEditorProps = {
  dirDetails: File | Folder | workspace
  fileId: string
  dirType: "workspace" | "folder" | "file"
}

var TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
]

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirDetails,
  fileId,
  dirType,
}) => {
  const supabase = createClientComponentClient()
  const { state, workspaceId, folderId, dispatch } = useAppState()
  const { socket, isConnected } = useSocket()
  const { user } = useSupabaseUser()
  const router = useRouter()
  const { toast } = useToast()
  const pathname = usePathname()
  const [quill, setQuill] = useState<Quill | null>(null)
  const [collaborators, setCollaborators] = useState<
    {
      id: string
      email: string
      avatarUrl: string
    }[]
  >([])

  const [saving, setSaving] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const [isDeletingBanner, setIsDeletingBanner] = useState(false)
  const [localCursors, setLocalCursors] = useState<any>([])

  const details = useMemo(() => {
    let selectedDir
    if (dirType === "file") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId)
    }

    if (dirType === "folder") {
      selectedDir = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileId)
    }

    if (dirType === "workspace") {
      selectedDir = state.workspaces.find(
        (workspace) => workspace.id === fileId
      )
    }

    if (selectedDir) {
      return selectedDir
    }

    return {
      title: dirDetails.title,
      iconId: dirDetails.iconId,
      createdAt: dirDetails.createdAt,
      data: dirDetails.data,
      inTrash: dirDetails.inTrash,
      bannerUrl: dirDetails.bannerUrl,
    } as workspace | File | Folder
  }, [state, workspaceId, folderId])

  const breadCrumbs = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return
    const segments = pathname
      .split("/")
      .filter((value) => value !== "dashboard" && value)

    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    )

    const workspaceBreadCrumb = workspaceDetails
      ? `${workspaceDetails.iconId} ${workspaceDetails.title}`
      : ""

    if (segments.length === 1) {
      return workspaceBreadCrumb
    }

    const folderSegment = segments[1]
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.id === folderSegment
    )

    const folderBreadCrumb = folderDetails
      ? `/ ${folderDetails.iconId} ${folderDetails.title}`
      : ""

    if (segments.length === 2) {
      return `${workspaceBreadCrumb} ${folderBreadCrumb}`
    }

    const fileSegment = segments[2]
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    )

    const fileBreadCrumb = fileDetails
      ? `/ ${fileDetails.iconId} ${fileDetails.title}`
      : ""

    return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`
  }, [state])

  //QUILL AND QUILL CURSORS SETUP
  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== "undefined") {
      if (wrapper === null) return
      wrapper.innerHTML = ""
      const editor = document.createElement("div")
      wrapper.append(editor)
      const Quill = (await import("quill")).default
      const QuillCursors = (await import("quill-cursors")).default
      Quill.register("modules/cursors", QuillCursors)

      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      })
      setQuill(q)
    }
  }, [])

  const restoreFileHandler = async () => {
    if (!workspaceId) return
    if (dirType === "file") {
      if (!folderId) return
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          fileData: { inTrash: "" },
          folderId,
          workspaceId,
          fileId,
        },
      })

      await updateFile({ inTrash: "" }, fileId)
    }

    if (dirType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folderData: { inTrash: "" },
          folderId: fileId,
          workspaceId,
        },
      })

      await updateFolder({ inTrash: "" }, fileId)
    }
  }

  const deleteFileHandler = async () => {
    if (!workspaceId) return
    if (dirType === "file") {
      if (!folderId) return
      dispatch({
        type: "DELETE_FILE",
        payload: {
          folderId,
          workspaceId,
          fileId,
        },
      })

      await deleteFile(fileId)
    }

    if (dirType === "folder") {
      dispatch({
        type: "DELETE_FOLDER",
        payload: {
          folderId: fileId,
          workspaceId,
        },
      })

      await deleteFolder(fileId)
      router.replace(`/dashboard/${workspaceId}`)
    }
  }

  const iconOnChange = async (icon: EmojiClickData) => {
    if (!fileId) return
    if (dirType === "workspace") {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: { iconId: icon.emoji },
          workspaceId: fileId,
        },
      })
      await updateWorkspace({ iconId: icon.emoji }, fileId)
    }

    if (dirType === "folder" && workspaceId) {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folderData: { iconId: icon.emoji },
          folderId: fileId,
          workspaceId,
        },
      })
      await updateFolder({ iconId: icon.emoji }, fileId)
    }

    if (dirType === "file" && folderId && workspaceId) {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          fileData: { iconId: icon.emoji },
          workspaceId,
          folderId,
          fileId,
        },
      })
      await updateFile({ iconId: icon.emoji }, fileId)
    }
  }

  const deleteBanner = async () => {
    const deleteFunction = async (url: string) => {
      try {
        await supabase.storage.from("file-banner").remove([url])
        toast({
          title: "Banner was removed",
        })
      } catch (err) {
        console.log(err)
      }
    }
    if (!details.bannerUrl || details.bannerUrl === "") return
    setIsDeletingBanner(true)
    if (dirType === "workspace") {
      await deleteFunction(details.bannerUrl)
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: { bannerUrl: "" },
          workspaceId: fileId,
        },
      })
      await updateWorkspace({ bannerUrl: "" }, fileId)
    }

    if (dirType === "folder" && workspaceId) {
      await deleteFunction(details.bannerUrl)
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folderData: { bannerUrl: "" },
          folderId: fileId,
          workspaceId,
        },
      })
      await updateFolder({ bannerUrl: "" }, fileId)
    }

    if (dirType === "file" && folderId && workspaceId) {
      await deleteFunction(details.bannerUrl)
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          fileData: { bannerUrl: "" },
          workspaceId,
          folderId,
          fileId,
        },
      })
      await updateFile({ bannerUrl: "" }, fileId)
    }
    setIsDeletingBanner(false)
  }

  //set editor contents
  useEffect(() => {
    let selectedDir
    const fetchInformation = async () => {
      if (dirType === "file") {
        const { data: selectedDir, error } = await getFileDetails(fileId)
        if (error || !selectedDir) {
          return router.replace("/dashboard")
        }
        if (!selectedDir[0]) {
          if (!workspaceId) return
          router.replace(`/dashboard/${workspaceId}`)
        }

        if (!workspaceId || quill === null) return
        if (!selectedDir[0].data) return

        quill.setContents(JSON.parse(selectedDir[0].data || ""), "api")

        dispatch({
          type: "UPDATE_FILE",
          payload: {
            fileData: { data: selectedDir[0].data },
            fileId,
            folderId: selectedDir[0].folderId,
            workspaceId,
          },
        })
      }

      if (dirType === "folder") {
        const { data: selectedDir, error } = await getFoldereDetails(fileId)
        if (error || !selectedDir) {
          return router.replace("/dashboard")
        }

        if (!selectedDir[0]) {
          router.replace(`/dashboard/${workspaceId}`)
        }

        if (!workspaceId || quill === null) return
        if (!selectedDir[0].data) return

        quill.setContents(JSON.parse(selectedDir[0].data || ""))

        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folderData: { data: selectedDir[0].data },
            folderId: fileId,
            workspaceId: selectedDir[0].workspaceId,
          },
        })
      }

      if (dirType === "workspace") {
        const { data: selectedDir, error } = await getWorkspaceDetails(fileId)
        if (error || !selectedDir) return router.replace("/dashboard")
        if (!selectedDir[0] || quill === null) return
        if (!selectedDir[0].data) return

        quill.setContents(JSON.parse(selectedDir[0].data || ""))

        dispatch({
          type: "UPDATE_WORKSPACE",
          payload: {
            workspace: { data: selectedDir[0].data },
            workspaceId: fileId,
          },
        })
      }
    }
    fetchInformation()
  }, [fileId, workspaceId, folderId, quill, dirType])

  //rooms
  useEffect(() => {
    if (socket === null || quill === null || !fileId) return
    socket.emit("create-room", fileId)
  }, [socket, quill, fileId])

  //send changes
  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user) return
    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === "user" && cursorId) {
          socket.emit("send-cursor-move", range, fileId, cursorId)
        }
      }
    }

    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setSaving(true)
      const contents = quill.getContents()
      const quillLength = quill.getLength()
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          if (dirType === "workspace") {
            dispatch({
              type: "UPDATE_WORKSPACE",
              payload: {
                workspace: { data: JSON.stringify(contents) },
                workspaceId: fileId,
              },
            })

            await updateWorkspace({ data: JSON.stringify(contents) }, fileId)
          }

          if (dirType === "folder" && workspaceId) {
            dispatch({
              type: "UPDATE_FOLDER",
              payload: {
                folderData: { data: JSON.stringify(contents) },
                workspaceId: workspaceId,
                folderId: fileId,
              },
            })

            await updateFolder({ data: JSON.stringify(contents) }, fileId)
          }

          if (dirType === "file" && workspaceId && folderId) {
            dispatch({
              type: "UPDATE_FILE",
              payload: {
                fileData: { data: JSON.stringify(contents) },
                workspaceId,
                folderId,
                fileId,
              },
            })

            await updateFile({ data: JSON.stringify(contents) }, fileId)
          }
        }
        setSaving(false)
      }, 900)
      socket.emit("send-changes", delta, fileId)
    }

    quill.on("text-change", quillHandler)
    quill.on("selection-change", selectionChangeHandler(user.id))

    return () => {
      quill.off("text-change", quillHandler)
      quill.off("selection-change", selectionChangeHandler(user.id))
      socket.off("emit-changes", quillHandler)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [quill, socket, fileId, user, details, folderId, workspaceId])

  //receive changes
  useEffect(() => {
    if (quill === null || socket === null) return
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        console.log("received")
        quill.updateContents(deltas, "api")
      }
    }
    socket.on("receive-changes", socketHandler)

    return () => {
      socket.off("receive-changes", socketHandler)
    }
  }, [quill, socket, fileId])

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return
    const socketHandler = (range: any, roomId: any, cursorId: string) => {
      if (roomId === fileId) {
        const cursorToMove = localCursors.find(
          (c: any) => c.cursors()?.[0].id === cursorId
        )
        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range)
        }
      }
    }

    socket.on("receive-cursor-move", socketHandler)
    return () => {
      socket.off("receive-cursor-move", socketHandler)
    }
  }, [quill, socket, fileId, localCursors])

  //set active users
  useEffect(() => {
    if (!fileId || quill === null) return
    const room = supabase.channel(fileId)

    const subscription = room
      .on("presence", { event: "sync" }, () => {
        const newState = room.presenceState()
        const newCollaborators = Object.values(newState).flat() as any
        setCollaborators(newCollaborators)

        if (user) {
          const allCursors: any = []
          newCollaborators.forEach(
            (collaborator: { id: string; email: string }) => {
              if (collaborator.id !== user.id) {
                const userCursor = quill.getModule("cursors")
                userCursor.createCursor(
                  collaborator.id,
                  collaborator.email.split("@")[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                )
                allCursors.push(userCursor)
              }
            }
          )
          setLocalCursors(allCursors)
        }
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !user) return
        const response = await findUser(user.id)
        if (!response) return
        room.track({
          id: user.id,
          email: user.email?.split("@")[0],
          avatarUrl: response.avatarUrl
            ? supabase.storage.from("avatar").getPublicUrl(response.avatarUrl)
                .data.publicUrl
            : "",
        })
      })

    return () => {
      supabase.removeChannel(room)
    }
  }, [fileId, quill, supabase, user])

  return (
    <div>
      {/* {isConnected ? (
        <div className="h-[4px] w-[4px] bg-green-600 rounded-full top-2 left-2 sticky z-[41]"></div>
      ) : (
        <div className="h-[4px] w-[4px] bg-red-600 rounded-full top-2 left-2 sticky z-[41]"></div>
      )} */}
      <div
        className={clsx(
          "h-[4px] w-[4px] rounded-full top-2 left-2 sticky z-[41]",
          {
            "bg-green-600": isConnected,
            "bg-red-600": !isConnected,
          }
        )}
      ></div>
      <div className="relative">
        {details.inTrash && (
          <article className="py-2 z-40 bg-[#EB5757] flex md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
              <span className="text-white">This {dirType} is in trash</span>
              <Button
                size="sm"
                variant={"outline"}
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={restoreFileHandler}
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant={"outline"}
                className="bg-transparent border-white text-white hover:bg-white hover:text-[#EB5757]"
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.inTrash}</span>
          </article>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
          <div>{breadCrumbs}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators.map((c, index) => {
                return (
                  <>
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar
                            className="
                            -ml-3
                            bg-background
                            border-2
                            flex
                            items-center
                            justify-center
                            border-white
                            h-8
                            w-8
                            rounded-full
                            "
                          >
                            <AvatarImage
                              className="rounded-full"
                              src={c.avatarUrl}
                            />
                            <AvatarFallback>
                              {c.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>{c.email}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )
              })}
            </div>
            {saving ? (
              <Badge
                variant={"secondary"}
                className="bg-orange-600 top-4 text-white right-4 z-50"
              >
                Saving...
              </Badge>
            ) : (
              <Badge
                variant={"secondary"}
                className="bg-emerald-600 top-4 text-white right-4 z-50"
              >
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>

      {details.bannerUrl && details.bannerUrl !== "" ? (
        <div className="relative w-full h-[200px]">
          <Image
            src={
              supabase.storage
                .from("file-banner")
                .getPublicUrl(details.bannerUrl).data.publicUrl
            }
            fill
            className="w-full md:h-48 object-cover"
            alt={"File banner image"}
          />
          <div className="w-full left-1/2 -translate-x-1/2 max-w-[800px] h-full absolute top-0 z-40">
            <div className="flex gap-4 relative top-[180px]">
              <BannerUpload
                id={fileId}
                bannerUrl={details.bannerUrl}
                dirType={dirType}
                className="ml-4"
              >
                <div className="transition-colors bg-background/50 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-card-foreground">
                  <ArrowUpFromLine />
                </div>
              </BannerUpload>
              <ToolTipComponent message="Remove Banner">
                <div className="transition-colors bg-background/50 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-card-foreground">
                  <Minus onClick={deleteBanner} />
                </div>
              </ToolTipComponent>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <div className="w-full max-w-[800px] mx-auto">
            <BannerUpload
              id={fileId}
              bannerUrl={details.bannerUrl}
              dirType={dirType}
              className="
              mt-2
              text-sm
              text-muted-foreground
              p-2
              hover:text-card-foreground
              transition-all
              rounded-md
              "
            >
              <div className="transition-colors bg-background/50 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-card-foreground flex items-center gap-2">
                <ArrowUpFromLine size={20} />
                <span className="text-sm">Upload a banner</span>
              </div>
            </BannerUpload>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div
          className="
          w-full
          self-center
          max-w-[800px]
          flex
          flex-col
          px-7
          lg:my-8
          "
        >
          <div className="text-[80px]">
            <EmojiPicker getValue={iconOnChange}>
              <div
                className="
            w-[100px]
            cursor-pointer
            transition-colors
            h-[100px]
            flex
            justify-center
            items-center
            hover:bg-muted
            rounded-xl
            "
              >
                {details.iconId}
              </div>
            </EmojiPicker>
          </div>
          <span className="text-muted-foreground text-3xl font-bold h-9">
            {details.title}
          </span>
          <span className="text-muted-foreground text-sm">
            {dirType.toUpperCase()}
          </span>
        </div>
        <div
          id="quill-container"
          className="max-w-[800px] "
          ref={wrapperRef}
        ></div>
        <div className="w-full h-[47px] border-t border-gray-500/50 sm:h-0"></div>
      </div>
    </div>
  )
}

export default QuillEditor
