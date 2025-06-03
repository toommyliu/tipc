// tipc/src/renderer.ts
import "@tybys/electron-ipc-handle-invoke/renderer";
var createClient = ({
  ipcInvoke
}) => {
  const createProxy = (path = []) => {
    return new Proxy(
      {},
      {
        get: (_, prop) => {
          const newPath = [...path, prop.toString()];
          const callable = (input) => {
            return ipcInvoke(newPath.join("."), input);
          };
          return new Proxy(callable, {
            get: (_2, nestedProp) => {
              if (nestedProp === "then" || nestedProp === "catch" || nestedProp === "finally") {
                const promise = callable(void 0);
                return promise[nestedProp].bind(promise);
              }
              return createProxy([...newPath, nestedProp.toString()]);
            }
          });
        }
      }
    );
  };
  return createProxy();
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
