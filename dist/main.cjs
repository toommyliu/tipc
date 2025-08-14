"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// tipc/src/main.ts
var main_exports = {};
__export(main_exports, {
  getRendererHandlers: () => getRendererHandlers,
  registerIpcMain: () => registerIpcMain,
  tipc: () => tipc
});
module.exports = __toCommonJS(main_exports);
var import_main = require("@tybys/electron-ipc-handle-invoke/main");
var import_uuid = require("@lukeed/uuid");
var import_electron = require("electron");

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
        import_electron.ipcMain.handle(channel, (e, payload) => {
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
          const id = (0, import_uuid.v4)();
          return new Promise((resolve, reject) => {
            import_electron.ipcMain.once(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getRendererHandlers,
  registerIpcMain,
  tipc
});
