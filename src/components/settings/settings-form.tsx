"use client"
import React, { useState, useRef, useEffect } from "react"
import { useToast } from "../ui/use-toast"
import { useAppState } from "@/lib/providers/state-provider"
import { User, workspace } from "@/lib/supabase/supabase.types"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Briefcase } from "lucide-react"
import { Separator } from "../ui/separator"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import {
  addCollaborators,
  deleteWorkspace,
  getCollaborators,
  removeCollaborators,
  updateWorkspace,
} from "@/lib/supabase/queries"
import { v4 } from "uuid"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Lock, Share, Plus } from "lucide-react"
import Image from "next/image"
import CollaboratorSearch from "../global/collaborator-search"
import { Button } from "../ui/button"
import { Alert, AlertDescription } from "../ui/alert"

const SettingsForm = () => {
  const { toast } = useToast()
  const { user } = useSupabaseUser()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { state, workspaceId, dispatch } = useAppState()
  const [permissions, setPermissions] = useState("private")
  const [collaborators, setCollaborators] = useState<User[] | []>([])
  const [openAlertMessage, setOpenAlertMessage] = useState(false)
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const [workspaceDetails, setWorkspaceDetails] = useState<workspace>()
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId) return
    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: {
        workspace: { title: e.target.value },
        workspaceId,
      },
    })
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current)
    titleTimerRef.current = setTimeout(async () => {
      const res = await updateWorkspace({ title: e.target.value }, workspaceId)
      if (res?.error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to change workspace name",
        })
      } else {
        toast({
          title: "Success",
          description: "Workspace name changes successfully",
        })
      }
    }, 1000)
  }

  const onChangeWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return
    const file = e.target.files?.[0]
    if (!file) return
    const uuid = v4()
    setUploadingLogo(true)

    const { data, error } = await supabase.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          workspace: { logo: data.path },
          workspaceId,
        },
      })

      const res = await updateWorkspace({ logo: data.path }, workspaceId)
      if (res?.error) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Failed to change workspace logo",
        })
      } else {
        toast({
          title: "Success",
          description: "Workspace logo changes successfully",
        })
      }
    } else {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to upload logo",
      })
    }
    setUploadingLogo(false)
  }

  const addCollaborator = async (user: User) => {
    if (!workspaceId) return
    await addCollaborators([user], workspaceId)
    setCollaborators([...collaborators, user])
    router.refresh()
  }

  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return
    await removeCollaborators([user], workspaceId)
    setCollaborators(collaborators.filter((c) => c.id !== user.id))
    if (collaborators.length === 0) setPermissions("private")
    router.refresh()
  }

  useEffect(() => {
    if (!workspaceId) return
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    )
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace)
  }, [state])

  useEffect(() => {
    if (!workspaceId) return
    const fetchCollaborators = async () => {
      const fetched = await getCollaborators(workspaceId)
      if (fetched.length > 0) {
        setPermissions("shared")
        setCollaborators(fetched)
      }
    }

    fetchCollaborators()
  }, [])

  const onClickAlertConfirm = async () => {
    if (!workspaceId) return
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId)
    }

    setPermissions("private")
    setOpenAlertMessage(false)
  }

  const onPermissionsChange = (val: string) => {
    if (val === "private") {
      setOpenAlertMessage(true)
    } else setPermissions(val)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 mt-5">
        <Briefcase size={20} />
        Workspace
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label
          className="text-sm text-muted-foreground"
          htmlFor="workspaceName"
        >
          Name
        </Label>
        <Input
          name="workspaceName"
          placeholder="Workspace Name"
          value={workspaceDetails ? workspaceDetails.title : ""}
          onChange={workspaceNameChange}
        />
        <Label
          className="text-sm text-muted-foreground"
          htmlFor="workspaceLogo"
        >
          Workspace Logo
        </Label>
        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Name"
          onChange={onChangeWorkspaceLogo}
          disabled={uploadingLogo}
        />
      </div>
      <div>
        <Label
          htmlFor="permissions"
          className="text-sm text-muted-foreground mb-1"
        >
          Permission
        </Label>
        <Select onValueChange={onPermissionsChange} value={permissions}>
          <SelectTrigger
            className="
            w-full
            h-26
            mt-3
            "
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectGroup>
                <SelectItem value="private">
                  <div
                    className="
                    p-2
                    flex
                    gap-4
                    justify-center
                    items-center
                    "
                  >
                    <Lock />
                    <article
                      className="
                      text-left
                      flex
                      flex-col
                      "
                    >
                      <span>Private</span>
                      <p>
                        Workspace is private, it can be shared with other users
                        later.
                      </p>
                    </article>
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div
                    className="
                    p-2
                    flex
                    gap-4
                    justify-center
                    items-center
                    "
                  >
                    <Share />
                    <article
                      className="
                      text-left
                      flex
                      flex-col
                      "
                    >
                      <span>Shared</span>
                      <p>Share your workspace with other users.</p>
                    </article>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {permissions === "shared" && (
        <div>
          <CollaboratorSearch
            existingCollaborators={collaborators}
            getCollaborator={(user) => {
              addCollaborator(user)
            }}
          >
            <Button type="button" className="text-sm my-2">
              <Plus />
              Add Collaborators
            </Button>
          </CollaboratorSearch>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">
              Collaborators {collaborators.length || ""}
            </span>
            <div className="h-[120px] w-full rounded-md mt-2 border border-muted-foreground/20 overflow-hidden">
              <div className="h-full w-full overflow-y-auto">
                {collaborators.length ? (
                  collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <Image
                          src={
                            c.avatarUrl
                              ? c.avatarUrl
                              : "/Images/default_avatar.webp"
                          }
                          alt={"User Profile Image"}
                          width={32}
                          height={32}
                          className="rounded-full mr-2"
                        />
                        <div className="text-sm gap-2 overflow-ellipsis sm:w-[300px] w-[140px]">
                          {c.email}
                        </div>
                      </div>
                      <Button
                        variant={"secondary"}
                        onClick={() => removeCollaborator(c)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    <span>No Collaborators added</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Alert variant={"destructive"}>
        <AlertDescription>
          Warning! Deleting this workspace will <b>permenantly</b> delete all
          the data related to workspace
        </AlertDescription>
        <Button
          type="submit"
          variant={"destructive"}
          size={"sm"}
          className="
          mt-4 
          text-sm
          bg-destructive/40 
          border-2 
          border-destructive
          "
          onClick={async () => {
            if (!workspaceId) return
            const { error } = await deleteWorkspace(workspaceId)
            if (error) {
              toast({
                title: "Error",
                variant: "destructive",
                description: "Failed to delete the workspace",
              })
            } else {
              toast({
                title: "Success",
                description: "Deleted workspace successfully",
              })
            }
            dispatch({
              type: "DELETE_WORKSPACE",
              payload: workspaceId,
            })
            router.replace("/dashboard")
          }}
        >
          Delete Workspace
        </Button>
      </Alert>
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDescription>
              Changing a shared workspace to a private workspace will remove all
              the collaborators permanently.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SettingsForm
