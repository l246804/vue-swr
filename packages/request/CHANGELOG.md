# @rhao/request

## 3.3.5

### Patch Changes

- a2fa001: chore: 异常 error 支持通过 cause 获取原始错误信息

## 3.3.4

### Patch Changes

- 64ed5f9: chore: 更新依赖包

## 3.3.3

### Patch Changes

- 5e635b7: fix: 修复 Options.dataCalibrator 部分场景下类型错误

## 3.3.2

### Patch Changes

- 06045a9: chore: 优化类型定义
- d90a732: feat: RequestContext 新增 getRawData 函数，获取原始 fetcher 执行结果
- 14e3933: fix: 修复 pending-manager 的 hasPending 判断错误

## 3.3.1

### Patch Changes

- bdbf9ad: chore: 更改部分错误注释

## 3.3.0

### Minor Changes

- c4c69be: feat: request 组合函数支持单次触发

## 3.2.0

### Minor Changes

- 980bdba: feat: RequestBasicContext 新增 isDisposed()

## 3.1.0

### Minor Changes

- 35c4088: feat: 新增 composables 中间件
- a67e146: feat: 新增 ignoreMiddleware 配置项，支持过滤带有 name 的中间件

## 3.0.2

### Patch Changes

- 1f837d5: chore: 更改 immediate 错误注释

## 3.0.1

### Patch Changes

- f33e2fa: chore: 更新 package.json 的导出配置

## 3.0.0

### Major Changes

- b905c2c: refactor: 重构核心功能

## 2.1.0

### Minor Changes

- a1e9f2e: feat: context 支持存取 store

### Patch Changes

- c5a18da: chore: 优化代码

## 2.0.0

### Major Changes

- 85be1ab: chore: 🤖 添加许可证文件

### Patch Changes

- Updated dependencies [85be1ab]
  - @rhao/request-utils@2.0.0

## 1.0.1

### Patch Changes

- aa84584: chore: 更新依赖包
- Updated dependencies [aa84584]
  - @rhao/request-utils@1.0.1

## 1.0.0

### Major Changes

- 3f4fdb3: feat: 开发 `request` 核心及其中间件

### Minor Changes

- 41ac650: feat: 新增 `isFailed` 函数，判断当前执行是否失败

### Patch Changes

- Updated dependencies [3f4fdb3]
  - @rhao/request-utils@1.0.0
