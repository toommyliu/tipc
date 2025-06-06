# @egoist/tipc

@egoist/tipc but targetting electron 6.1.12. Compiled files are served in the [built branch](https://github.com/toommyliu/tipc/tree/built).

# Changes Made
1. Add `ipcMain.handle()` and `ipcRenderer.invoke()` polyfill (which was added in v7)
2. Use `@lukeed/uuid` instead of `node:crypto` crypto.randomUUID() (runtime incompatible)
3. Added support for CommonJS imports

# Usage

## CommonJS

```js
// Main process
const { createMainIPC } = require('@egoist/tipc/main');

// Renderer process
const { createRendererIPC } = require('@egoist/tipc/renderer');
```

## ES Modules

```js
// Main process
import { createMainIPC } from '@egoist/tipc/main';

// Renderer process
import { createRendererIPC } from '@egoist/tipc/renderer';
```

# Original README
[ORIGINAL-README.md](ORIGINAL-README.md)
