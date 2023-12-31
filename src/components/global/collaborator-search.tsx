import { User } from "@/lib/supabase/supabase.types"
import { useState } from "react"
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider"
import { searchUsers } from "@/lib/supabase/queries"
import { debounce } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"

type CollaboratorSearchProps = {
  existingCollaborators: User[] | null
  getCollaborator: (collaborator: User) => void
  children: React.ReactNode
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const [searchResults, setSearchResults] = useState<User[] | []>([])
  const { user } = useSupabaseUser()

  const addCollaborator = (user: User) => {
    getCollaborator(user)
  }

  const search = debounce(async (query: string) => {
    const res = await searchUsers(query)
    setSearchResults(res)
  }, 800)

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value)
  }

  return (
    <Sheet>
      <SheetTrigger className="w-full">{children}</SheetTrigger>
      <SheetContent
        className="
        w-[400px]
        sm:w-[540px]
        "
      >
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
          <SheetDescription>
            <p className="text-sm text-muted-foreground">
              You can also remove collaborators after addind them from the
              settings tab
            </p>
          </SheetDescription>
        </SheetHeader>
        <div
          className="
          flex justify-center
          items-center
          gap-2
          mt-2
          "
        >
          <Search />
          <Input
            name="name"
            className="dark:bg-background"
            placeholder="Email"
            onChange={onChangeHandler}
          />
        </div>
        <ScrollArea
          className="mt-6
          overflow-y-auto
          w-full
          rounded-md
          "
        >
          <div className="flex flex-col gap-2 rounded-md">
            {searchResults
              .filter(
                (result) =>
                  !existingCollaborators?.some(
                    (existing) => existing.id === result.id
                  )
              )
              .filter((result) => result.id !== user?.id)
              .map((user) => (
                <>
                  <div
                    key={user.id}
                    className="p-4 flex justify-between items-center bg-primary/50"
                  >
                    <div
                      className="text-sm 
                    gap-2 
                    overflow-hidden 
                    overflow-ellipsis 
                    w-[180px] 
                    "
                    >
                      {user.email}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => addCollaborator(user)}
                    >
                      Add
                    </Button>
                  </div>
                </>
              ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default CollaboratorSearch
