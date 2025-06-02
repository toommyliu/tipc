# @egoist/tipc

@egoist/tipc but targetting electron 6.1.12. Compiled files are served in the [built branch](https://github.com/toommyliu/tipc/tree/built).

# Changes Made
1. Add `ipcMain.handle()` and `ipcRenderer.invoke()` polyfill (which was added in v7)
2. Use `@lukeed/uuid` instead of `node:crypto` crypto.randomUUID() (runtime incompatible)

# Original README
[ORIGINAL-README.md](ORIGINAL-README.md)
