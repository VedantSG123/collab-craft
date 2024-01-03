"use server"
import db from "./db"
import { files, folders, users, workspaces } from "../../../migrations/schema"
import { Folder, workspace, User, File } from "./supabase.types"
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

//workspaces------------------------------------------------------------
export const createWorkspace = async (workspace: workspace) => {
  try {
    const response = await db.insert(workspaces).values(workspace)
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error: error }
  }
}

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
    return { data: null, error: null }
  } catch (err) {
    console.log(err)
    return { data: null, error: "Error" }
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

export const updateWorkspace = async (
  workspaceData: Partial<workspace>,
  workspaceId: string
) => {
  if (!workspaceId) return
  try {
    await db
      .update(workspaces)
      .set(workspaceData)
      .where(eq(workspaces.id, workspaceId))

    return { data: null, error: null }
  } catch (err) {
    console.log(err)
    return { data: null, error: "Error" }
  }
}

//Folders----------------------------------------------------------------
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

//Collaborators-------------------------------------------------------------
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

export const removeCollaborators = async (
  users: User[],
  workspaceId: string
) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    })

    if (userExists) {
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            eq(collaborators.userId, user.id)
          )
        )
    }
  })
}

export const getCollaborators = async (workspaceId: string) => {
  const response = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.workspaceId, workspaceId))
  if (!response.length) return []

  const userInfo: Promise<User | undefined>[] = response.map(async (user) => {
    const exists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, user.userId),
    })
    return exists
  })

  const resolvedUsers = await Promise.all(userInfo)
  return resolvedUsers.filter(Boolean) as User[]
}

export const searchUsers = async (email: string) => {
  if (!email) return []
  const accounts = db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`))
  return accounts
}

//Files------------------------------------------------------------------
export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId)
  if (!isValid) return { data: null, error: "Error" }
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId))) as File[] | []
    return { data: results, error: null }
  } catch (err) {
    console.log(err)
    return { data: null, error: err }
  }
}

export const createFile = async (file: File) => {
  try {
    await db.insert(files).values(file)
    return { data: null, error: null }
  } catch (err) {
    console.log(err)
    return { data: null, error: "Error" }
  }
}

export const updateFile = async (fileData: Partial<File>, fid: string) => {
  try {
    await db.update(files).set(fileData).where(eq(files.id, fid))
    return { data: null, error: null }
  } catch (err) {
    console.log(err)
    return { data: null, error: "Error" }
  }
}
