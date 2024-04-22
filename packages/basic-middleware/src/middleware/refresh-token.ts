/* eslint-disable unused-imports/no-unused-vars */
import type { BasicRequestHook, RequestContext, RequestMiddleware } from '@rhao/request'
import { castError, toValue } from 'nice-fns'
import type { AwaitableFn, PromiseFn } from '@rhao/types-base'
import { assign, once, pick } from 'lodash-unified'

export interface RequestRefreshTokenOptions {
  /**
   * 单例模式，设为 `false` 时每个 `useRequest` 将单独处理过期刷新令牌
   * @default true
   */
  singleMode?: boolean
  /**
   * 本次过期是否允许刷新令牌
   * @default
   * ```ts
   * () => true
   * ```
   */
  allow?: AwaitableFn<[key: string, context: RequestContext<any, any[]>], boolean>
  /**
   * 验证刷新令牌是否过期
   */
  expired: AwaitableFn<[error: Error & { cause?: any }], boolean>
  /**
   * 允许刷新令牌时的具体刷新操作
   */
  handler: PromiseFn<[context: RequestContext<any, any[]>], void>
}

const GLOB_REQUEST = {} as BasicRequestHook

let refreshPromiseMap: WeakMap<BasicRequestHook, Promise<any> | null>
const init = once(() => {
  refreshPromiseMap = new WeakMap()
})

export function RequestRefreshToken(initialOptions: RequestRefreshTokenOptions) {
  init()

  const middleware: RequestMiddleware = {
    name: 'Basic:RequestRefreshToken',
    priority: 1000,
    handler: (ctx, next) => {
      const options = assign(
        { singleMode: true, allow: () => true } as Partial<RequestRefreshTokenOptions>,
        initialOptions,
        pick(ctx.getOptions().refreshToken, ['allow', 'singleMode']),
      )
      const { request, fetcher, getKey, getOptions } = ctx
      const promiseMapKey = options.singleMode ? GLOB_REQUEST : request

      // 允许刷新令牌时更改 fetcher
      if (toValue(options.allow, getKey(), ctx)) {
        ctx.fetcher = async (...args) => {
          // 如果存在正在刷新 token 的请求则等待其结束后再调用
          if (refreshPromiseMap.has(promiseMapKey)) {
            return Promise.resolve(refreshPromiseMap.get(promiseMapKey)).then(() =>
              fetcher(...args),
            )
          }

          try {
            // 正常调用 fetcher，之后再通过 dataParser 解析数据，验证请求是否失败
            const data = await fetcher(...args)
            await getOptions().dataParser(data)
            return data
          } catch (err: unknown) {
            // 请求失败后验证根据当前的错误验证是否是 token 过期导致的
            const error = castError(err) as Error & { cause?: any }
            if (error !== err) error.cause = err
            const isExpired = await options.expired(error)
            if (!isExpired) return Promise.reject(error)

            // 如果是过期导致的则调用注册时传入的 handler 进行处理
            if (!refreshPromiseMap.has(promiseMapKey))
              refreshPromiseMap.set(promiseMapKey, options.handler(ctx))

            return (
              Promise.resolve(refreshPromiseMap.get(promiseMapKey))
                // 新的请求出错则抛出新请求的错误
                .then(() => !ctx.isCanceled() && Promise.resolve(fetcher(...args)))
                // 异常时抛出初次执行请求时的错误
                .catch(() => Promise.reject(error))
                .finally(() => {
                  // 结束后清空 promise
                  refreshPromiseMap.delete(promiseMapKey)
                })
            )
          }
        }
      }

      // 调用下一个中间件
      return next()
    },
  }

  return middleware
}

declare module '@rhao/request' {
  interface RequestOptions<TData, TParams extends unknown[] = unknown[]> {
    /**
     * 刷新 Token 配置
     */
    refreshToken?: Pick<RequestRefreshTokenOptions, 'allow'>
  }
}
