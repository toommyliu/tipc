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
var flattenRouter = (router, prefix = "") => {
  const flattened = {};
  for (const [key, value] of Object.entries(router)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && "action" in value) {
      flattened[fullKey] = value;
    } else {
      Object.assign(flattened, flattenRouter(value, fullKey));
    }
  }
  return flattened;
};
var registerIpcMain = (router) => {
  const flattenedRouter = flattenRouter(router);
  for (const [name, route] of Object.entries(flattenedRouter)) {
    import_electron.ipcMain.handle(name, (e, payload) => {
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
          const id = (0, import_uuid.v4)();
          return new Promise((resolve, reject) => {
            import_electron.ipcMain.once(id, (_2, { error, result }) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getRendererHandlers,
  registerIpcMain,
  tipc
});
