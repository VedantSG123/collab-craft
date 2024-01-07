import MobileSidebar from "@/components/sidebar/mobile-sidebar"
import Sidebar from "@/components/sidebar/sidebar"

type LayoutPropos = {
  children: React.ReactNode
  params: any
}

const Layout: React.FC<LayoutPropos> = ({ children, params }) => {
  return (
    <main
      className="flex
      h-screen
      w-screen
      overflow-hidden
      "
    >
      <Sidebar params={params} />
      <MobileSidebar>
        <Sidebar params={params} className="w-screen inline-block sm:hidden" />
      </MobileSidebar>
      <div
        className="dark:border-neutrals-8/70
        border-l-[1px]
        w-full
        relative
        overflow-y-auto
        flex-1
        "
      >
        {children}
      </div>
    </main>
  )
}

export default Layout
