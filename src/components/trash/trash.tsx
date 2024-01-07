import CustomDialogTrigger from "../global/custom-dialog"
import TrashForm from "./trash-form"

type TrashProps = {
  children: React.ReactNode
}

const Trash: React.FC<TrashProps> = ({ children }) => {
  return (
    <CustomDialogTrigger header="Trash" content={<TrashForm />}>
      {children}
    </CustomDialogTrigger>
  )
}

export default Trash
