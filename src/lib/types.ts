import { Socket as NetSocket, Server as NetServer } from "net"
import { Server as SocketIoServer } from "socket.io"
import { NextApiResponse } from "next"
import { z } from "zod"
export const FormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid Email" }),
  password: z.string().describe("Password").min(1, "Password is required"),
})

export const CreateWorkspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .describe("Workspace Name")
    .min(1, "Workspace name must be minimum of one character"),
  logo: z.any(),
})

export const UploadBannerFormSchema = z.object({
  banner: z.string().describe("Banner Image"),
})

export type NextApiResponseServerIo = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io: SocketIoServer
    }
  }
}
