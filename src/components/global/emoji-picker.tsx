"use client"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { EmojiClickData } from "emoji-picker-react"

type EmojiPickerProps = {
  children: React.ReactNode
  getValue?: (emoji: EmojiClickData) => void
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ children, getValue }) => {
  const router = useRouter()
  const Picker = dynamic(() => import("emoji-picker-react"))
  const onClick = (selectedEmoji: EmojiClickData) => {
    if (getValue) getValue(selectedEmoji)
  }

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer text-md">
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="
            p-0
            border-none
          "
        >
          <Picker onEmojiClick={onClick}></Picker>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default EmojiPicker
