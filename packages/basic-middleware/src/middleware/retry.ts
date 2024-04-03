/* eslint-disable unused-imports/no-unused-vars */
import type { RequestContext, RequestMiddleware } from '@rhao/request'
import { castError, sleep, toValue } from 'nice-fns'
import type { AwaitableFn, Fn, MaybeFn, MaybeGetter } from '@rhao/types-base'
import { assign } from 'lodash-unified'

export interface RequestRetryOptions {
  /**
   * 错误重试次数，如果设置为 `-1`，则无限次重试
   * @default 0
   */
  count?: MaybeGetter<number>
  /**
   * 是否允许错误重试，在执行 `fetcher()` 后验证，返回 `false` 则回归原执行流，否则开始错误重试
   * @default
   * ```ts
   * () => true
   * ```
   */
  allow?: AwaitableFn<[error: Error & { cause?: any }, key: string, context: RequestContext<any, any[]>], boolean>
  /**
   * - 重试时间间隔,单位：ms
   * - 默认采用简易的指数退避算法
   *   + 第一次重试等待 2s
   *   + 第二次重试等待 4s
   *   + 以以此类推，如果大于 30s，则取 30s
   * @default
   * ```ts
   * 2 ** retryCount * 1e3
   * ```
   */
  interval?: MaybeFn<number, [count: number]>
}

export function RequestRetry(initialOptions?: RequestRetryOptions) {
  const middleware: RequestMiddleware = {
    name: 'Basic:RequestRetry',
    priority: 900,
    handler: (ctx, next) => {
      const { hooks, fetcher, getOptions, isCanceled } = ctx
      const options = assign(
        {
          count: 0,
          allow: () => true,
          interval: (count) => Math.min(30e3, 2 ** count * 1e3),
        } as RequestRetryOptions,
        initialOptions,
        getOptions().retry,
      )

      const countValue = toValue(options.count!)
      if (countValue !== -1 && countValue < 1) return next()

      const callFetcher = async (...args) => {
        const result = { data: undefined as any, error: undefined as Error | undefined }
        if (isCanceled()) return result

        try {
          const data = await fetcher(...args)
          await getOptions().dataParser(data)
          result.data = data
        }
        catch (err: unknown) {
          const error = castError(err) as Error & { cause?: any }
          if (error !== err) error.cause = err
          result.error = error
        }

        return result
      }

      let count = 0
      ctx.fetcher = async (...args) => {
        // 正常调用
        let result = await callFetcher(...args)
        if (!result.error) return result.data

        const valid = await options.allow!(result.error, ctx.getKey(), ctx)
        if (!valid) return Promise.reject(result.error)

        // 重试
        // eslint-disable-next-line no-unmodified-loop-condition
        while ((countValue === -1 || count++ < countValue) && result.error && !isCanceled()) {
          hooks.callHook('retry:progress', count, ctx)
          hooks.callHook('error', result.error, ctx)

          await sleep(toValue(options.interval, count))
          result = await callFetcher(...args)
        }

        if (result.error) {
          hooks.callHook('retry:fail', result.error, ctx)
          return Promise.reject(result.error)
        }

        hooks.callHook('retry:success', result.data, ctx)
        return result.data
      }

      return next()
    },
  }

  return middleware
}

declare module '@rhao/request' {
  interface RequestOptions<TData, TParams extends unknown[] = unknown[]> {
    /**
     * 重试配置
     */
    retry?: RequestRetryOptions
  }

  interface RequestConfigHooks<TData, TParams extends unknown[] = unknown[]> {
    /**
     * 重试进行中
     */
    'retry:progress': Fn<[count: number, context: RequestContext<TData, TParams>]>
    /**
     * 重试前触发
     */
    'retry:success': Fn<[data: TData, context: RequestContext<TData, TParams>]>
    /**
     * 重试后触发
     */
    'retry:fail': Fn<[error: Error & { cause?: any }, context: RequestContext<TData, TParams>]>
  }
}
