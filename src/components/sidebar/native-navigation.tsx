import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"
import { Box, Settings, Trash } from "lucide-react"

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
            <Settings className="text-primary" />
            <span className="ml-2">Settings</span>
          </Link>
        </li>
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
            <Trash className="text-primary" />
            <span className="ml-2">Trash</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default NativeNavigation
