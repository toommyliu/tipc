import "@tybys/electron-ipc-handle-invoke/renderer"
import { IpcRenderer, IpcRendererEvent } from "electron"
import type {
  ClientFromRouter,
  RouterType,
  RendererHandlers,
  RendererHandlersListener,
} from "./types"

export const createClient = <Router extends RouterType>({
  ipcInvoke,
}: {
  ipcInvoke: IpcRenderer["invoke"]
}) => {
  const createProxy = (path: string[] = []): any => {
    return new Proxy(
      {},
      {
        get: (_, prop) => {
          const newPath = [...path, prop.toString()]

          const callable = (input: any) => {
            return ipcInvoke(newPath.join("."), input)
          }

          return new Proxy(callable, {
            get: (_, nestedProp) => {
              if (
                nestedProp === "then" ||
                nestedProp === "catch" ||
                nestedProp === "finally"
              ) {
                const promise = callable(undefined)
                return (promise as any)[nestedProp].bind(promise)
              }

              // Continue building the path for nested access
              return createProxy([...newPath, nestedProp.toString()])
            },
          })
        },
      }
    )
  }

  return createProxy() as ClientFromRouter<Router>
}

export const createEventHandlers = <T extends RendererHandlers>({
  on,

  send,
}: {
  on: (
    channel: string,
    handler: (event: IpcRendererEvent, ...args: any[]) => void
  ) => () => void

  send: IpcRenderer["send"]
}) =>
  new Proxy<RendererHandlersListener<T>>({} as any, {
    get: (_, prop) => {
      return {
        listen: (handler: any) =>
          on(prop.toString(), (event, ...args) => handler(...args)),

        handle: (handler: any) => {
          return on(prop.toString(), async (event, id: string, ...args) => {
            try {
              const result = await handler(...args)
              send(id, { result })
            } catch (error) {
              send(id, { error })
            }
          })
        },
      }
    },
  })
