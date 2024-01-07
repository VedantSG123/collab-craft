"use client"
import { useState } from "react"
import { User, workspace } from "@/lib/supabase/supabase.types"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import { useRouter } from "next/navigation"
import { Lock, Plus, Share } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
} from "../ui/select"
import { Button } from "../ui/button"
import { v4 } from "uuid"
import { addCollaborators, createWorkspace } from "@/lib/supabase/queries"
import CollaboratorSearch from "./collaborator-search"
import Loader from "./Loader"
import Image from "next/image"
import { useToast } from "../ui/use-toast"

const WorkspaceCreator = () => {
  const { user } = useSupabaseUser()
  const router = useRouter()
  const [permissions, setPermissions] = useState("private")
  const [title, setTitle] = useState("")
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addCollaborator = (user: User) => {
    setCollaborators([...collaborators, user])
  }

  const removeCollaborator = (user: User) => {
    setCollaborators(collaborators.filter((c) => c.id !== user.id))
  }

  const createItem = async () => {
    const uuid = v4()
    setIsLoading(true)
    if (user?.id) {
      const newWorkspace: workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: "⭐",
        id: uuid,
        inTrash: "",
        title,
        workspaceOwner: user.id,
        logo: null,
        bannerUrl: "",
      }

      if (permissions === "private") {
        await createWorkspace(newWorkspace)
        toast({
          title: "Success",
          description: "Workspace created successfully",
        })
        router.refresh()
      }

      if (permissions === "shared") {
        await createWorkspace(newWorkspace)
        await addCollaborators(collaborators, uuid)
        toast({
          title: "Success",
          description: "Shared workspace created successfully",
        })
        router.refresh()
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="flex gap-4 flex-col p-1">
      <div>
        <Label htmlFor="name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          name="name"
          className=" mt-1"
          value={title}
          placeholder="Workspace Name"
          onChange={(e) => {
            setTitle(e.target.value)
          }}
        />
      </div>
      <div>
        <Label
          htmlFor="permissions"
          className="text-sm text-muted-foreground mb-1"
        >
          Permission
        </Label>
        <Select
          onValueChange={(val) => {
            setPermissions(val)
          }}
          defaultValue={permissions}
        >
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
                  collaborators.map((c, index) => (
                    <div
                      key={index}
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
      <div>
        <Button
          className="w-full"
          type="button"
          disabled={
            !title ||
            (permissions === "shared" && collaborators.length === 0) ||
            isLoading
          }
          onClick={createItem}
        >
          {isLoading ? <Loader /> : "Create"}
        </Button>
      </div>
    </div>
  )
}

export default WorkspaceCreator
