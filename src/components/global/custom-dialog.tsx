import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import clsx from "clsx"

type CustomDialogTriggerProps = {
  header?: string
  content?: React.ReactNode
  children: React.ReactNode
  description?: string
  className?: string
}

const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({
  header,
  content,
  children,
  description,
  className,
}) => {
  return (
    <Dialog>
      <DialogTrigger className={clsx("", className)}>{children}</DialogTrigger>
      <DialogContent
        className="h-screen
      block
      sm:h-[440px]
      overflow-scroll
      w-full
      "
      >
        <DialogHeader>{header}</DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialogTrigger