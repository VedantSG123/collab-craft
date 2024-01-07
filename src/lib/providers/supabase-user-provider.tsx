"use client"

import { AuthUser } from "@supabase/supabase-js"
import { Subscription } from "../supabase/supabase.types"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getUserSubscriptionStatus } from "../supabase/queries"
import { useToast } from "@/components/ui/use-toast"

type SupabaseUserContextType = {
  user: AuthUser | null
  subscription: Subscription | null
}

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  subscription: null,
})

export const useSupabaseUser = () => {
  return useContext(SupabaseUserContext)
}

type SupabaseUserProviderProps = {
  children: React.ReactNode
}

const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  //fetch user details
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data, error } = await getUserSubscriptionStatus(user.id)

        if (data) {
          setSubscription(data)
        }
        if (error) {
          console.log("❌ User not found", error)
        }
      }
    }
    getUser()
  }, [supabase, subscription])
  return (
    <SupabaseUserContext.Provider value={{ user, subscription }}>
      {children}
    </SupabaseUserContext.Provider>
  )
}

export default SupabaseUserProvider
