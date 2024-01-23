"use client"
import { io as ClientIO, SocketOptions } from "socket.io-client"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env" })

type SocketContextType = {
  socket: any | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setToken(session.access_token)
      }
    }
    getToken()
  }, [])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      console.log("❌ No Backend url found")
      return
    }

    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_BACKEND_URL, {
      auth: {
        token: token,
      },
    })

    socketInstance.on("connect", () => setIsConnected(true))
    socketInstance.on("connect_error", (err) => {
      console.log(err.message)
    })
    socketInstance.on("disconnect", () => setIsConnected(false))
    setSocket(socketInstance)
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
