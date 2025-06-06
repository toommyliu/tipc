// tipc/src/main.ts
import "@tybys/electron-ipc-handle-invoke/main";
import { v4 as uuid } from "@lukeed/uuid";
import { ipcMain } from "electron";

// tipc/src/tipc.ts
var createChainFns = () => {
  return {
    input() {
      return createChainFns();
    },
    action: (action) => {
      return {
        action
      };
    }
  };
};
var tipc = {
  create() {
    return {
      procedure: createChainFns()
    };
  }
};

// tipc/src/main.ts
var registerIpcMain = (router) => {
  for (const [name, route] of Object.entries(router)) {
    ipcMain.handle(name, (e, payload) => {
      return route.action({ context: { sender: e.sender }, input: payload });
    });
  }
};
var getRendererHandlers = (contents) => {
  return new Proxy({}, {
    get: (_, prop) => {
      return {
        send: (...args) => contents.send(prop.toString(), ...args),
        invoke: async (...args) => {
          const id = uuid();
          return new Promise((resolve, reject) => {
            ipcMain.once(id, (_2, { error, result }) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            });
            contents.send(prop.toString(), id, ...args);
          });
        }
      };
    }
  });
};
export {
  getRendererHandlers,
  registerIpcMain,
  tipc
};
