export const dynamic = "force-dynamic"

import QuillEditor from "@/components/quill-editor/quill-editor"
import { getFoldereDetails } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import React from "react"

const FolderPage = async ({ params }: { params: { folderId: string } }) => {
  const { data, error } = await getFoldereDetails(params.folderId)
  if (error || !data.length) redirect("/dashboadr")
  return (
    <div className="relative">
      <QuillEditor
        fileId={params.folderId}
        dirType="folder"
        dirDetails={data[0] || {}}
      />
    </div>
  )
}

export default FolderPage
