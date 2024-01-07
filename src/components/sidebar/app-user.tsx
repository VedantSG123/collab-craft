import React, { useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import db from "@/lib/supabase/db"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import ToggleTheme from "../global/toggle-theme"

type AppUserProps = {
  className?: string
}

const AppUser: React.FC<AppUserProps> = async ({ className }) => {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, user.id),
  })
  if (!response) return
  let avatarPath
  if (!response.avatarUrl || response.avatarUrl === "") avatarPath = ""
  else {
    avatarPath = await supabase.storage
      .from("avatar")
      .getPublicUrl(response.avatarUrl)?.data.publicUrl
  }

  const profile = {
    ...response,
    avatarUrl: avatarPath,
  }

  return (
    <div className={twMerge("rounded-lg bg-muted/50 px-2 py-2", className)}>
      <div className="flex justify-between">
        <div className="flex items-center grow">
          <Avatar className="mr-2">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback>
              {profile.email?.substring(0, 2).toUpperCase() || "CC"}
            </AvatarFallback>
          </Avatar>

          <span className="overflow-ellipsis overflow-hidden max-w-[120px]">
            {profile.email}
          </span>
        </div>

        <div className="relative">
          <ToggleTheme />
        </div>
      </div>
    </div>
  )
}

export default AppUser
