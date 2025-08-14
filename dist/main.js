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
  const walk = (obj, prefix = "") => {
    for (const [key, val] of Object.entries(obj)) {
      const channel = prefix ? `${prefix}.${key}` : key;
      if ("action" in val) {
        const route = val;
        ipcMain.handle(channel, (e, payload) => {
          return route.action({ context: { sender: e.sender }, input: payload });
        });
      } else {
        walk(val, channel);
      }
    }
  };
  walk(router);
};
var getRendererHandlers = (contents) => {
  const makeProxy = (prefix = "") => new Proxy({}, {
    get: (_, prop) => {
      const name = prop.toString();
      const channel = prefix ? `${prefix}.${name}` : name;
      return {
        send: (...args) => contents.send(channel, ...args),
        invoke: async (...args) => {
          const id = uuid();
          return new Promise((resolve, reject) => {
            ipcMain.once(
              id,
              (_event, payload) => {
                const { error, result } = payload || {};
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            contents.send(channel, id, ...args);
          });
        }
      };
    }
  });
  return makeProxy();
};
export {
  getRendererHandlers,
  registerIpcMain,
  tipc
};
