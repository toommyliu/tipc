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

// tipc/src/renderer.ts
var renderer_exports = {};
__export(renderer_exports, {
  createClient: () => createClient,
  createEventHandlers: () => createEventHandlers
});
module.exports = __toCommonJS(renderer_exports);
var import_renderer = require("@tybys/electron-ipc-handle-invoke/renderer");
var createClient = ({
  ipcInvoke
}) => {
  const makeProxy = (prefix = "") => {
    const fn = (input) => ipcInvoke(prefix, input);
    return new Proxy(fn, {
      get: (_t, prop) => {
        const name = prop.toString();
        const channel = prefix ? `${prefix}.${name}` : name;
        return makeProxy(channel);
      }
    });
  };
  return new Proxy(() => {
  }, {
    get: (_, prop) => makeProxy(prop.toString())
  });
};
var createEventHandlers = ({
  on,
  send
}) => {
  const makeProxy = (prefix = "") => new Proxy({}, {
    get: (_, prop) => {
      const name = prop.toString();
      const channel = prefix ? `${prefix}.${name}` : name;
      return {
        listen: (handler) => on(channel, (event, ...args) => handler(...args)),
        handle: (handler) => on(channel, async (event, id, ...args) => {
          try {
            const result = await handler(...args);
            send(id, { result });
          } catch (error) {
            send(id, { error });
          }
        })
      };
    }
  });
  return makeProxy();
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClient,
  createEventHandlers
});
