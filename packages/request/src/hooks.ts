import type { AwaitableFn, Fn } from '@rhao/types-base'
import type { HookCallback, HookKeys, Hookable } from 'hookable'
import { createHooks as _createHooks } from 'hookable'
import type { RequestBasicContext, RequestContext } from './context'
import type { RequestState } from './state'

/**
 * "xxx.d.ts" or "xxx.ts"
 *
 * @example
 * ```ts
 * declare module '@rhao/request' {
 *   interface RequestConfigHooks<TData, TParams extends unknown[] = unknown[]> {
 *     custom: (value: number) => void // 自定义 hooks
 *   }
 * }
 * ```
 */
export interface RequestConfigHooks<TData = any, TParams extends unknown[] = unknown[]> {
  /**
   * 执行 `executor()` 时触发，早于 `before`，此时尚未对 `state` 做任何操作，用于处理前置条件
   */
  preface: AwaitableFn<[params: TParams, context: RequestContext<TData, TParams>], any>

  /**
   * 执行 `fetcher()` 前触发
   */
  before: AwaitableFn<[params: TParams, context: RequestContext<TData, TParams>], any>

  /**
   * 执行 `fetcher()` 成功时触发
   */
  success: AwaitableFn<[data: TData, context: RequestContext<TData, TParams>], any>

  /**
   * 执行 `fetcher()` 错误时触发
   */
  error: AwaitableFn<[error: Error & { cause?: any }, context: RequestContext<TData, TParams>], any>

  /**
   * 执行 `fetcher()` 后成功或失败后触发，取消执行时不触发
   */
  after: AwaitableFn<
    [state: RequestState<TData, TParams>, context: RequestContext<TData, TParams>],
    any
  >

  /**
   * 执行 `executor()` 结束时触发，同 `Promise.finally`，每次执行均会触发该事件，用于释放资源
   */
  finally: AwaitableFn<[context: RequestContext<TData, TParams>], any>

  /**
   * 主动调用 `dispose()` 时触发，用于释放资源
   */
  dispose: AwaitableFn<[context: RequestBasicContext<TData, TParams>], any>

  /**
   * 执行 `cancel()` 时触发
   */
  cancel: AwaitableFn<
    [state: RequestState<TData, TParams>, context: RequestContext<TData, TParams>],
    any
  >

  /**
   * 执行 `cancel()` 时由于竞态条件而被取消请求时触发
   */
  discarded: AwaitableFn<[context: RequestContext<TData, TParams>], any>

  /**
   * `state` 变更时触发，参数为本次变更的 `state`
   */
  stateChange: Fn<
    [state: Partial<RequestState<TData, TParams>>, context: RequestBasicContext<TData, TParams>],
    any
  >
}

export type RequestHookable = Hookable<RequestConfigHooks> & {
  callHookSync<NameT extends HookKeys<RequestConfigHooks> = HookKeys<RequestConfigHooks>>(
    name: NameT,
    ...arguments_: Parameters<
      RequestConfigHooks[NameT] extends HookCallback ? RequestConfigHooks[NameT] : never
    >
  ): void
}

const defaultTask = { run: (function_: HookCallback) => function_() }
const _createTask = () => defaultTask
// @ts-expect-error
// eslint-disable-next-line no-console
const createTask = typeof console.createTask !== 'undefined' ? console.createTask : _createTask

export function syncSerialTaskCaller<
  T extends HookCallback = HookCallback,
  P extends unknown[] = Parameters<HookCallback>,
>(hooks: T[], args: P) {
  const name = args.shift()
  const task = createTask(name)
  return hooks.forEach((hookFunction) => task.run(() => hookFunction(...args)))
}

export function createHooks() {
  const hooks = _createHooks<RequestConfigHooks>() as RequestHookable
  function callHookSync(this: Hookable<RequestConfigHooks>, name, ...args) {
    args.unshift(name)
    this.callHookWith(syncSerialTaskCaller, name, ...args)
  }
  hooks.callHookSync = callHookSync.bind(hooks)
  return hooks
}
