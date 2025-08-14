// tipc/src/renderer.ts
import "@tybys/electron-ipc-handle-invoke/renderer";
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
export {
  createClient,
  createEventHandlers
};
