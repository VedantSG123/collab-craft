import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"
import { Box, Settings as SettingsIcon, Trash as TrashICON } from "lucide-react"
import Settings from "../settings/settings"
import Trash from "../trash/trash"

type NativeNavigationProps = {
  myWorkspace: string
  className?: string
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspace,
  className,
}) => {
  return (
    <nav className={twMerge("my-2", className)}>
      <ul className="flex flex-col">
        <li>
          <Link
            className="
            group/native
            flex
            text-neutrals-7
            transition-all
            hover:bg-muted
            p-2
            rounded-md
            "
            href={`dashboard/${myWorkspace}`}
          >
            <Box className="text-primary" />
            <span className="ml-2">My Workspace</span>
          </Link>
        </li>
        <Settings>
          <li
            className="
            group/native
            flex
            text-neutrals-7
            transition-all
            hover:bg-muted
            p-2
            rounded-md
            "
          >
            <SettingsIcon className="text-primary" />
            <span className="ml-2">Settings</span>
          </li>
        </Settings>
        <Trash>
          <li
            className="
          group/native
          flex
          text-neutrals-7
          transition-all
          hover:bg-muted
          p-2
          rounded-md
          "
          >
            <TrashICON className="text-primary" />
            <span className="ml-2">Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  )
}

export default NativeNavigation
