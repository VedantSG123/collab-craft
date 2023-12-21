import TitleSection from "@/components/landing-page/TitleSection"
import { Button } from "@/components/ui/button"

const HomePage = () => {
  return (
    <section>
      <div className="overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col gap-4 md:justify-center md:items-center">
        <TitleSection
          pill="💫 Your Workspace Perfected"
          title="All-in-one Collaboration and Productivity platform"
        />
        <div className="bg-white p-[2px] mt-6 rounded-full bg-gradient-to-r from-primary to-green-400 sm:w-[300px]">
          <Button
            variant="secondary"
            className="w-full rounded-full text-2xl bg-background"
          >
            Get Squads Free
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HomePage
