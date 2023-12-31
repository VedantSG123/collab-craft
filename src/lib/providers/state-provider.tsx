"use client"

import { createContext, Dispatch, useReducer, useMemo, useContext } from "react"
import { usePathname } from "next/navigation"
import { File, Folder, workspace } from "../supabase/supabase.types"

export type appFoldersType = Folder & { files: File[] | [] }
export type appWorkspacesType = workspace & { folders: appFoldersType[] | [] }

type AppState = {
  workspaces: appWorkspacesType[] | []
}

type Action =
  | { type: "ADD_WORKSPACE"; payload: appWorkspacesType }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | {
      type: "UPDATE_WORKSPACE"
      payload: { workspace: Partial<appWorkspacesType>; workspaceId: string }
    }
  | {
      type: "SET_WORKSPACES"
      payload: { workspaces: appWorkspacesType[] | [] }
    }
  | {
      type: "SET_FOLDERS"
      payload: { workspaceId: string; folders: appFoldersType[] | [] }
    }
  | {
      type: "ADD_FOLDER"
      payload: { workspaceId: string; folder: appFoldersType }
    }
  | {
      type: "UPDATE_FOLDER"
      payload: {
        workspaceId: string
        folderId: string
        folderData: Partial<Folder>
      }
    }

const initialState: AppState = { workspaces: [] }

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case "ADD_WORKSPACE":
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
      }
    case "DELETE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.filter(
          (workspace) => workspace.id !== action.payload
        ),
      }
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              ...action.payload.workspace,
            }
          }
          return workspace
        }),
      }
    case "SET_WORKSPACES":
      return {
        ...state,
        workspaces: action.payload.workspaces,
      }
    case "SET_FOLDERS":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: action.payload.folders.sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            }
          }
          return workspace
        }),
      }
    case "ADD_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: [...workspace.folders, action.payload.folder].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
            }
          }
          return workspace
        }),
      }
    case "UPDATE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return {
                    ...folder,
                    ...action.payload.folderData,
                  }
                }
                return folder
              }),
            }
          }
          return workspace
        }),
      }
    default:
      return initialState
  }
}

const AppStateContext = createContext<
  | {
      state: AppState
      dispatch: Dispatch<Action>
      workspaceId: string | undefined
      folderId: string | undefined
      fileId: string | undefined
    }
  | undefined
>(undefined)

type AppStateProviderProps = {
  children: React.ReactNode
}

const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const pathname = usePathname()

  const workspaceId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean)
    if (urlSegments) {
      if (urlSegments.length > 1) {
        return urlSegments[1]
      }
    }
  }, [pathname])

  const folderId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean)
    if (urlSegments) {
      if (urlSegments.length > 2) {
        return urlSegments[2]
      }
    }
  }, [pathname])

  const fileId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean)
    if (urlSegments) {
      if (urlSegments.length > 3) {
        return urlSegments[3]
      }
    }
  }, [pathname])

  return (
    <AppStateContext.Provider
      value={{ state, dispatch, workspaceId, folderId, fileId }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export default AppStateProvider

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvide")
  }
  return context
}
