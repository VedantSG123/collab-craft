"use client"
import { AuthUser } from "@supabase/supabase-js"
import { useForm, SubmitHandler } from "react-hook-form"
import { CreateWorkspaceFormSchema } from "@/lib/types"
import { z } from "zod"
import { useState } from "react"
import { v4 } from "uuid"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

import EmojiPicker from "../global/emoji-picker"
import Loader from "../global/Loader"
import { toast } from "../ui/use-toast"
import { workspace } from "@/lib/supabase/supabase.types"
import { createWorkspace } from "@/lib/supabase/queries"

interface DashBoardSetupProps {
  user: AuthUser
  subscription: {} | null
}

const DashBoardSetup = ({ user, subscription }: DashBoardSetupProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState("⭐")
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    mode: "onChange",
    defaultValues: {
      logo: "",
      workspaceName: "",
    },
  })
  const supabase = createClientComponentClient()

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateWorkspaceFormSchema>
  > = async (value) => {
    const file = value.logo?.[0]
    let filepath = null
    const workspaceUUID = v4()

    //save the file in bucket and get its path
    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from("workspace-logos")
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: "3600",
            upsert: true,
          })
        if (error) throw new Error("")
        filepath = data.path
      } catch (error) {
        console.log("Error", error)
        toast({
          variant: "destructive",
          title: "Error! Cannot upload workspace logo",
        })
      }
    }

    //create workspace in database
    try {
      const newWorkspace: workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: selectedEmoji,
        id: workspaceUUID,
        inTrash: "",
        title: value.workspaceName,
        workspaceOwner: user.id,
        logo: filepath || null,
        bannerUrl: "",
      }

      const { data, error: createError } = await createWorkspace(newWorkspace)
      if (createError) {
        throw new Error()
      }

      toast({
        title: "Workspace create",
        description: `${newWorkspace.title} has been created successfully`,
      })

      router.replace(`/dashboard/${newWorkspace.id}`)
    } catch (error) {
      console.log("Error", error)
      toast({
        variant: "destructive",
        title: "Could not create a new workspace",
        description:
          "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
      })
    } finally {
      reset()
    }
  }

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Create a workspace to get started. You can add collaborators later in
          the workspace settings
        </CardDescription>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  <EmojiPicker
                    getValue={(emoji) => setSelectedEmoji(emoji.emoji)}
                  >
                    {selectedEmoji}
                  </EmojiPicker>
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="workspaceName"
                    className="text-sm
                    text-muted-foreground
                    "
                  >
                    Name
                  </Label>
                  <Input
                    id="workspaceName"
                    type="text"
                    placeholder="Workspace Name"
                    disabled={isLoading}
                    {...register("workspaceName", {
                      required: "Workspace name is required",
                    })}
                  />
                  <small className="text-red-600">
                    {errors?.workspaceName?.message?.toString()}
                  </small>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="workspaceLogo"
                  className="text-sm
                    text-muted-foreground
                    "
                >
                  Workspace logo
                </Label>
                <Input
                  id="workspaceLogo"
                  type="file"
                  accept="image/*"
                  placeholder="Workspace Logo"
                  disabled={isLoading}
                  {...register("logo")}
                />
                <small className="text-red-600">
                  {errors?.logo?.message?.toString()}
                </small>
              </div>
              <div>
                <Button disabled={isLoading} type="submit">
                  {isLoading ? <Loader /> : "Create Workspace"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </CardHeader>
    </Card>
  )
}

export default DashBoardSetup
