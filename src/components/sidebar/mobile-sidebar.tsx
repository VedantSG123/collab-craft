"use client"
import React, { useEffect, useState } from "react"
import { Menu, Layers3 } from "lucide-react"
import clsx from "clsx"
import { useAppState } from "@/lib/providers/state-provider"
type MobileSidebarProps = {
  children: React.ReactNode
}

export const NativeNavigation = [
  {
    title: "Sidebar",
    id: "sidebar",
    customIcon: Menu,
  },
  {
    title: "Pages",
    id: "pages",
    customIcon: Layers3,
  },
] as const

const MobileSidebar: React.FC<MobileSidebarProps> = ({ children }) => {
  const [selectedNav, setSelectedNav] = useState("")
  const { workspaceId, folderId } = useAppState()

  useEffect(() => {
    setSelectedNav("pages")
  }, [workspaceId, folderId])

  return (
    <>
      {selectedNav === "sidebar" && <>{children}</>}
      <nav className="bg-black/50 backdrop-blur-sm sm:hidden fixed z-50 bottom-0 right-0 left-0">
        <ul className="flex justify-around items-center p-2">
          {NativeNavigation.map((item) => {
            return (
              <li
                className={clsx("flex items-center flex-col justify-center", {
                  "text-primary": selectedNav === item.id,
                })}
                key={item.id}
                onClick={() => setSelectedNav(item.id)}
              >
                <item.customIcon size={16}></item.customIcon>
                <small
                  className={clsx("text-[10px]", {
                    "text-muted-foreground": selectedNav !== item.id,
                  })}
                >
                  {item.title}
                </small>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

export default MobileSidebar
