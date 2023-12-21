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
      "
    >
      <Sidebar params={params} />
      <div
        className="dark:border-neutral-12/70
        border-l-[1px]
        w-full
        relative
        overflow-scroll
        "
      >
        {children}
      </div>
    </main>
  )
}

export default Layout
