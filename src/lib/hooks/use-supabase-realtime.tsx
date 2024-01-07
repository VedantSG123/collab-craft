import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect } from "react"
import { useAppState } from "../providers/state-provider"
import { useRouter } from "next/navigation"
import { File, Folder } from "../supabase/supabase.types"

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient()

  const { dispatch, state, workspaceId: selectedWorkspace } = useAppState()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "files" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("🟢 Real time event")
            const {
              folder_id: folderId,
              workspace_id: workspaceId,
              id: fileId,
            } = payload.new

            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
                ?.files.find((file) => file.id === fileId)
            ) {
              const newFile: File = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                folderId: payload.new.folder_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              }

              dispatch({
                type: "ADD_FILE",
                payload: {
                  file: newFile,
                  workspaceId,
                  folderId,
                },
              })
            }
          }

          if (payload.eventType === "DELETE") {
            console.log("🟢 Real time event")
            const {
              workspace_id: workspaceId,
              folder_id: folderId,
              id: fileId,
            } = payload.old

            if (
              state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
                ?.files.find((file) => file.id === fileId)
            ) {
              dispatch({
                type: "DELETE_FILE",
                payload: {
                  fileId: fileId,
                  workspaceId,
                  folderId,
                },
              })
            }
          }

          if (payload.eventType === "UPDATE") {
            console.log("🟢 Real time event")
            const {
              workspace_id: workspaceId,
              folder_id: folderId,
              id: fileId,
            } = payload.new

            if (
              state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
                ?.files.find((file) => file.id === fileId)
            ) {
              const newData: Partial<File> = {
                title: payload.new.title,
                iconId: payload.new.icon_id,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              }

              dispatch({
                type: "UPDATE_FILE",
                payload: {
                  fileId,
                  workspaceId,
                  folderId,
                  fileData: newData,
                },
              })
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("🟢 Real time event")
            const { id: folderId, workspace_id: workspaceId } = payload.new

            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
            ) {
              const newFolder: Folder = {
                id: payload.new.id,
                workspaceId: payload.new.workspace_id,
                createdAt: payload.new.created_at,
                title: payload.new.title,
                iconId: payload.new.icon_id,
                data: payload.new.data,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              }

              dispatch({
                type: "ADD_FOLDER",
                payload: {
                  workspaceId,
                  folder: {
                    ...newFolder,
                    files: [],
                  },
                },
              })
            }
          }

          if (payload.eventType === "DELETE") {
            console.log("🟢 Real time event")
            const { workspace_id: workspaceId, id: folderId } = payload.old

            if (
              state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
            ) {
              dispatch({
                type: "DELETE_FOLDER",
                payload: {
                  workspaceId,
                  folderId,
                },
              })
            }
          }

          if (payload.eventType === "UPDATE") {
            console.log("🟢 Real time event")
            const { workspace_id: workspaceId, id: folderId } = payload.new

            if (
              state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
            ) {
              const newData: Partial<Folder> = {
                title: payload.new.title,
                iconId: payload.new.icon_id,
                inTrash: payload.new.in_trash,
                bannerUrl: payload.new.banner_url,
              }

              dispatch({
                type: "UPDATE_FOLDER",
                payload: {
                  workspaceId,
                  folderId,
                  folderData: newData,
                },
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, state, selectedWorkspace])
  return null
}

export default useSupabaseRealtime
