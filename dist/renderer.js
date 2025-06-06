// tipc/src/renderer.ts
import "@tybys/electron-ipc-handle-invoke/renderer";
var createClient = ({
  ipcInvoke
}) => {
  return new Proxy({}, {
    get: (_, prop) => {
      const invoke = (input) => {
        return ipcInvoke(prop.toString(), input);
      };
      return invoke;
    }
  });
};
var createEventHandlers = ({
  on,
  send
}) => new Proxy({}, {
  get: (_, prop) => {
    return {
      listen: (handler) => on(prop.toString(), (event, ...args) => handler(...args)),
      handle: (handler) => {
        return on(prop.toString(), async (event, id, ...args) => {
          try {
            const result = await handler(...args);
            send(id, { result });
          } catch (error) {
            send(id, { error });
          }
        });
      }
    };
  }
});
export {
  createClient,
  createEventHandlers
};
