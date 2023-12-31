import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip"

type ToolTipComponentProps = {
  children: React.ReactNode
  message: string
}

const ToolTipComponent: React.FC<ToolTipComponentProps> = ({
  children,
  message,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ToolTipComponent
