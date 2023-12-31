"use server"
import db from "./db"
import { folders, users, workspaces } from "../../../migrations/schema"
import { Folder, workspace, User } from "./supabase.types"
import { Subscription } from "./supabase.types"
import { validate } from "uuid"
import { and, eq, ilike, notExists } from "drizzle-orm"
import { collaborators } from "./schema"

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    })
    if (data) return { data: data as Subscription, error: null }
    else return { data: null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const createWorkspace = async (workspace: workspace) => {
  try {
    const response = await db.insert(workspaces).values(workspace)
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error: error }
  }
}

//Not shared workspaces
export const getPrivateWorkspace = async (userId: string) => {
  if (!userId) return []
  const privateWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
      )
    )) as workspace[]

  return privateWorkspaces
}

//workspaces shared with me
export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return []
  const collaboratedWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(users.id, userId))) as workspace[]

  return collaboratedWorkspaces
}

//Workspaces shared by me
export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return []

  const sharedWorkspaces = (await db
    .selectDistinct({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
    })
    .from(workspaces)
    .orderBy(workspaces.createdAt)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId))) as workspace[]

  return sharedWorkspaces
}

export const getFolders = async (workspaceId: string) => {
  const isVaild = validate(workspaceId)
  if (!isVaild) {
    return {
      data: null,
      error: "Error",
    }
  }

  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId))

    return { data: results, error: null }
  } catch (error) {
    return { data: null, error: error }
  }
}

export const createFolder = async (folder: Folder) => {
  try {
    const result = await db.insert(folders).values(folder)
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error: "Error" }
  }
}

export const updateFolder = async (
  folderData: Partial<Folder>,
  folderId: string
) => {
  try {
    await db.update(folders).set(folderData).where(eq(folders.id, folderId))
    return { data: null, error: null }
  } catch (err) {
    console.log(err)
    return { data: null, error: "Error" }
  }
}

export const addCollaborators = async (users: User[], workspaceId: string) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    })

    if (!userExists) {
      await db.insert(collaborators).values({ workspaceId, userId: user.id })
    }
  })
}

export const searchUsers = async (email: string) => {
  if (!email) return []
  const accounts = db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`))
  return accounts
}
