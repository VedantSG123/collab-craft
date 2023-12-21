"use client"
import { useState } from "react"
import { User } from "@/lib/supabase/supabase.types"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import { useRouter } from "next/navigation"

const WorkspaceCreator = () => {
  const { user } = useSupabaseUser()
  const router = useRouter()
  const [permissions, setPermissions] = useState("private")
  const [title, setTitle] = useState("")
  const [collaborators, setCollaborators] = useState<User[]>([])

  const addCollaborators = (user: User) => {
    setCollaborators([...collaborators, user])
  }

  const removeCollaborators = (user: User) => {
    setCollaborators(collaborators.filter((c) => c.id !== user.id))
  }
  return <div></div>
}

export default WorkspaceCreator
