import TitleSection from "@/components/landing-page/TitleSection"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import AppImage from "../../../public/Images/demo.png"

const HomePage = () => {
  return (
    <section>
      <div className="overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col gap-4 md:justify-center md:items-center">
        <TitleSection
          pill="💫 Create - Craft - Collab"
          title="All-in-one Collaboration and Productivity platform"
        />
        <div className="bg-white p-[2px] mt-6 rounded-full bg-gradient-to-r from-primary to-green-400 sm:w-[300px]">
          <Link href={"/login"}>
            <Button
              variant="secondary"
              className="w-full rounded-full text-2xl bg-background"
            >
              Get Started
            </Button>
          </Link>
        </div>
        <div className="relative overflow-hidden mt-10">
          <Image
            src={AppImage}
            alt="Application Image"
            className="rounded-lg"
          />
        </div>
      </div>
    </section>
  )
}

export default HomePage
