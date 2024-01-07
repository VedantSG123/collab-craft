import CustomDialogTrigger from "../global/custom-dialog"
import BannerUploadForm from "./banner-upload-form"

type BannerUploadProps = {
  id: string
  bannerUrl: string | null
  dirType: "workspace" | "folder" | "file"
  children: React.ReactNode
  className?: string
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  dirType,
  id,
  bannerUrl,
  children,
  className,
}) => {
  return (
    <CustomDialogTrigger
      header="Upload Banner"
      content={
        <BannerUploadForm dirType={dirType} id={id} bannerUrl={bannerUrl} />
      }
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  )
}

export default BannerUpload
