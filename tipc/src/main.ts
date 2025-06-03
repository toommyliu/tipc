import "@tybys/electron-ipc-handle-invoke/main"
import { v4 as uuid } from "@lukeed/uuid"
import { WebContents, ipcMain } from "electron"
import {
  RendererHandlers,
  RendererHandlersCaller,
  RouterType,
  ActionFunction,
} from "./types"
import { tipc } from "./tipc"
export { tipc }

const flattenRouter = (
  router: RouterType,
  prefix = ""
): Record<string, { action: ActionFunction }> => {
  const flattened: Record<string, { action: ActionFunction }> = {}

  for (const [key, value] of Object.entries(router)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === "object" && "action" in value) {
      flattened[fullKey] = value as { action: ActionFunction }
    } else {
      // Nested router
      Object.assign(flattened, flattenRouter(value as RouterType, fullKey))
    }
  }

  return flattened
}

export const registerIpcMain = (router: RouterType) => {
  const flattenedRouter = flattenRouter(router)

  for (const [name, route] of Object.entries(flattenedRouter)) {
    ipcMain.handle(name, (e, payload) => {
      return route.action({ context: { sender: e.sender }, input: payload })
    })
  }
}

export const getRendererHandlers = <T extends RendererHandlers>(
  contents: WebContents
) => {
  return new Proxy<RendererHandlersCaller<T>>({} as any, {
    get: (_, prop) => {
      return {
        send: (...args: any[]) => contents.send(prop.toString(), ...args),

        invoke: async (...args: any[]) => {
          const id = uuid()

          return new Promise((resolve, reject) => {
            ipcMain.once(id, (_, { error, result }) => {
              if (error) {
                reject(error)
              } else {
                resolve(result)
              }
            })
            contents.send(prop.toString(), id, ...args)
          })
        },
      }
    },
  })
}

export * from "./types"
