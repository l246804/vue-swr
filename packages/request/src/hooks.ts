import type { AwaitableFn, Fn } from 'types/utils'
import type { HookCallback, HookKeys, Hookable } from 'hookable'
import { createHooks as _createHooks } from 'hookable'
import type { RequestBasicContext, RequestContext } from './context'
import type { RequestState } from './state'

export type RequestHookable = Hookable<RequestHooks> & {
  callHookSync<NameT extends HookKeys<RequestHooks> = HookKeys<RequestHooks>>(
    name: NameT,
    ...arguments_: Parameters<
      RequestHooks[NameT] extends HookCallback ? RequestHooks[NameT] : never
    >
  ): void
}

/**
 * 自定义 `hooks`
 */
export interface RequestCustomHooks {}

export interface RequestHooks<TData = any, TParams extends unknown[] = unknown[]> {
  /**
   * 执行 `fetcher()` 前触发
   */
  before: AwaitableFn<[TParams, RequestContext<TData, TParams>]>

  /**
   * 执行 `fetcher()` 成功时触发
   */
  success: AwaitableFn<[TData, RequestContext<TData, TParams>]>

  /**
   * 执行 `fetcher()` 错误时触发
   */
  error: AwaitableFn<[Error, RequestContext<TData, TParams>]>

  /**
   * 执行 `fetcher()` 后触发，同 `Promise.finally`
   */
  after: AwaitableFn<[RequestState<TData, TParams>, RequestContext<TData, TParams>]>

  /**
   * 执行 `fetcher()` 取消时触发
   */
  cancel: AwaitableFn<[RequestState<TData, TParams>, RequestContext<TData, TParams>]>

  /**
   * 请求状态变更时触发，多次并发调用仅在初次和所有请求结束后触发
   */
  loadingChange: Fn<[boolean, RequestContext<TData, TParams>]>

  /**
   * 状态变更时触发，参数为本次变更的状态
   */
  stateChange: Fn<[Partial<RequestState<TData, TParams>>, RequestBasicContext<TData, TParams>]>
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
  const hooks = _createHooks<RequestHooks>() as RequestHookable
  function callHookSync(this: Hookable<RequestHooks>, name, ...args) {
    args.unshift(name)
    this.callHookWith(syncSerialTaskCaller, name, ...args)
  }
  hooks.callHookSync = callHookSync.bind(hooks)
  return hooks
}
