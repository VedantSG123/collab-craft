import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
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
        w-full
        border-muted
        overflow-y-auto
        "
      >
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialogTrigger
