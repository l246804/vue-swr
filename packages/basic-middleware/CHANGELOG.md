# @rhao/request-basic-middleware

## 4.3.3

### Patch Changes

- 4dc1a08: chore: refreshToken 支持取消二次请求

## 4.3.2

### Patch Changes

- a2fa001: chore: 异常 error 支持通过 cause 获取原始错误信息
- Updated dependencies [a2fa001]
  - @rhao/request@3.3.5

## 4.3.1

### Patch Changes

- 64ed5f9: chore: 更新依赖包
- Updated dependencies [64ed5f9]
  - @rhao/request@3.3.4

## 4.3.0

### Minor Changes

- 85f5feb: feat: 优化 RequestSWR、RequestRetry

### Patch Changes

- Updated dependencies [bdbf9ad]
  - @rhao/request@3.3.1

## 4.2.1

### Patch Changes

- d8dfa50: fix: 修复 RequestRefreshToken 无法正常进入 handler

## 4.2.0

### Minor Changes

- ad5862a: feat: swr 支持在 staleTime 不大于 0 时关闭保鲜功能

## 4.1.1

### Patch Changes

- 42798b5: chore: 移动中间件源码至 middleware 目录，并修复 package.json 的 exports 导出配置

## 4.1.0

### Minor Changes

- 0429ed4: feat: swr 新增支持持久化存储功能

### Patch Changes

- c0a1c7a: refactor: 修改 package.json exports 方式
- 0f4b51a: chore: 中间件补充 name
- Updated dependencies [35c4088]
- Updated dependencies [a67e146]
  - @rhao/request@3.1.0

## 4.0.0

### Major Changes

- 53db0b3: chore: update deps

### Patch Changes

- Updated dependencies [b905c2c]
  - @rhao/request@3.0.0

## 3.0.0

### Minor Changes

- a08e72d: refactor: 重构数据中心，使用 context 提供的方式

### Patch Changes

- Updated dependencies [c5a18da]
- Updated dependencies [a1e9f2e]
  - @rhao/request@2.1.0

## 2.0.0

### Major Changes

- 85be1ab: chore: 🤖 添加许可证文件

### Patch Changes

- Updated dependencies [85be1ab]
  - @rhao/request@2.0.0
  - @rhao/request-utils@2.0.0

## 1.0.2

### Patch Changes

- chore: 完善 refresh-token 中间件

## 1.0.1

### Patch Changes

- aa84584: chore: 更新依赖包
- Updated dependencies [aa84584]
- Updated dependencies [aa84584]
  - @rhao/request@1.0.1
  - @rhao/request-utils@1.0.1

## 1.0.0

### Major Changes

- 3f4fdb3: feat: 开发 `request` 核心及其中间件

### Minor Changes

- e3849ec: feat: 新增 `refresh-token` 中间件

  - 新增 `refresh-token` 中间件，用于无感刷新 `token`
  - 修复 `retry` 中间件在未设置 `count` 时未调用 `next`
  - 修复 `retry` 中间件默认的 `interval` 指数计算错误
  - 完善 `swr` 中间件流程
  - 删除带有副作用的初始化配置项
  - 更新 `index.ts` 只用于集体导出

### Patch Changes

- Updated dependencies [3f4fdb3]
- Updated dependencies [41ac650]
  - @rhao/request@1.0.0
  - @rhao/request-utils@1.0.0
