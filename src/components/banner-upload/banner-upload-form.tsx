"use client"
import { useAppState } from "@/lib/providers/state-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { UploadBannerFormSchema } from "@/lib/types"
import { z } from "zod"
import { v4 } from "uuid"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import Loader from "../global/Loader"
import { useToast } from "../ui/use-toast"
import {
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/queries"

type BannerUploadFormProps = {
  dirType: "workspace" | "file" | "folder"
  bannerUrl: string | null
  id: string
}

const BannerUploadForm: React.FC<BannerUploadFormProps> = ({
  dirType,
  id,
  bannerUrl,
}) => {
  const supabase = createClientComponentClient()
  const { workspaceId, folderId, dispatch } = useAppState()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: "onChange",
    defaultValues: {
      banner: "",
    },
  })

  const deleteOldBanner = async (url: string) => {
    try {
      await supabase.storage.from("file-banner").remove([url])
      toast({
        title: "Old banner was removed",
      })
    } catch (err) {
      console.log(err)
    }
  }

  const onSubmitHandler: SubmitHandler<
    z.infer<typeof UploadBannerFormSchema>
  > = async (values) => {
    const file = values.banner?.[0]
    if (!file || !id) return
    try {
      let filePath = null
      const uploadBanner = async () => {
        const uuid = v4()
        const { data, error } = await supabase.storage
          .from("file-banner")
          .upload(`banner-${uuid}`, file, {
            cacheControl: "5",
            upsert: true,
          })
        if (error) {
          throw error
        }
        filePath = data.path
      }

      if (dirType === "file" && workspaceId && folderId) {
        await uploadBanner()
        dispatch({
          type: "UPDATE_FILE",
          payload: {
            fileData: { bannerUrl: filePath },
            workspaceId,
            folderId,
            fileId: id,
          },
        })
        await updateFile({ bannerUrl: filePath }, id)
      }

      if (dirType === "folder" && workspaceId) {
        await uploadBanner()
        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folderData: { bannerUrl: filePath },
            folderId: id,
            workspaceId,
          },
        })
        await updateFolder({ bannerUrl: filePath }, id)
      }

      if (dirType === "workspace") {
        await uploadBanner()
        dispatch({
          type: "UPDATE_WORKSPACE",
          payload: {
            workspace: { bannerUrl: filePath },
            workspaceId: id,
          },
        })
        await updateWorkspace({ bannerUrl: filePath }, id)
      }

      if (bannerUrl && bannerUrl !== "") {
        deleteOldBanner(bannerUrl)
      }
    } catch (err) {
      console.log(err)
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to upload the banner",
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex flex-col gap-2"
    >
      <Label className="text-sm text-muted-foreground" htmlFor="bannerImage">
        Banner Image
      </Label>
      <Input
        id="bannerImage"
        type="file"
        accept="image/*"
        disabled={isUploading}
        {...register("banner", { required: "Banner Image is required" })}
      />
      <small className="text-red-600">
        {errors.banner?.message?.toString()}
      </small>
      <Button>{isUploading ? <Loader /> : "Upload Banner"}</Button>
    </form>
  )
}

export default BannerUploadForm
