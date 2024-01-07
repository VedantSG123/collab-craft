"use client"
import { appFoldersType, useAppState } from "@/lib/providers/state-provider"
import React, { useEffect, useState } from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"
import {
  deleteFile,
  deleteFolder,
  updateFile,
  updateFolder,
} from "@/lib/supabase/queries"
import { File } from "@/lib/supabase/supabase.types"

const TrashForm = () => {
  const { state, dispatch, workspaceId } = useAppState()
  const { toast } = useToast()
  const [folders, setFolders] = useState<appFoldersType[] | []>([])
  const [files, setFiles] = useState<File[] | []>([])

  useEffect(() => {
    const trashFolders =
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => folder.inTrash) || []

    setFolders(trashFolders)

    let trashFiles: File[] = []
    state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (file.inTrash) {
            trashFiles.push(file)
          }
        })
      })
    setFiles(trashFiles)
  }, [state, workspaceId])

  const restoreFolderHandler = async (id: string) => {
    if (!workspaceId) return
    dispatch({
      type: "UPDATE_FOLDER",
      payload: {
        folderData: { inTrash: "" },
        workspaceId,
        folderId: id,
      },
    })

    const { error } = await updateFolder({ inTrash: "" }, id)
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to restore the folder",
      })
    } else {
      toast({
        title: "Success",
        description: "Restored the folder",
      })
    }
  }

  const deleteFolderHandler = async (id: string) => {
    if (!workspaceId) return
    try {
      await deleteFolder(id)
      dispatch({
        type: "DELETE_FOLDER",
        payload: {
          folderId: id,
          workspaceId,
        },
      })
    } catch (err) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to delete the folder",
      })
    }
  }

  const restoreFileHandler = async (file: File) => {
    if (!workspaceId) return
    dispatch({
      type: "UPDATE_FILE",
      payload: {
        fileData: { inTrash: "" },
        workspaceId,
        folderId: file.folderId,
        fileId: file.id,
      },
    })

    const { error } = await updateFile({ inTrash: "" }, file.id)
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to restore the file",
      })
    } else {
      toast({
        title: "Success",
        description: "Restored the file",
      })
    }
  }

  const deleteFileHandler = async (file: File) => {
    if (!workspaceId) return
    try {
      await deleteFile(file.id)
      dispatch({
        type: "DELETE_FILE",
        payload: {
          folderId: file.folderId,
          workspaceId,
          fileId: file.id,
        },
      })
    } catch (err) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to delete the file",
      })
    }
  }

  return (
    <ScrollArea>
      <p className="font-semibold my-2">FOLDERS</p>
      <hr></hr>
      <div className="flex flex-col gap-2 mt-2">
        {folders.map((folder) => {
          return (
            <div
              key={folder.id}
              className="flex items-center bg-muted p-4 rounded-md justify-between"
            >
              <div>
                <div>
                  <span className="ml-2">{folder.iconId}</span>
                  {folder.title}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={"outline"}
                  className="bg-muted-foreground border hover:bg-white hover:text-[#57eb57]"
                  onClick={() => restoreFolderHandler(folder.id)}
                >
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant={"outline"}
                  className="bg-muted-foreground border hover:bg-white hover:text-[#EB5757]"
                  onClick={() => deleteFolderHandler(folder.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <p className="font-semibold my-2">FILES</p>
      <hr></hr>
      <div className="flex flex-col gap-2 mt-2">
        {files.map((file) => {
          return (
            <div
              key={file.id}
              className="flex items-center bg-muted p-4 rounded-md justify-between"
            >
              <div>
                <div>
                  <span className="ml-2">{file.iconId}</span>
                  {file.title}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={"outline"}
                  className="bg-muted-foreground border hover:bg-white hover:text-[#57eb57]"
                  onClick={() => restoreFileHandler(file)}
                >
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant={"outline"}
                  className="bg-muted-foreground border hover:bg-white hover:text-[#EB5757]"
                  onClick={() => deleteFileHandler(file)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

export default TrashForm
