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

export const registerIpcMain = (router: RouterType) => {
  for (const [name, route] of Object.entries(router)) {
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
