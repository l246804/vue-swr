import type { Awaitable, MaybeFn } from '@rhao/types-base'
import { toValue } from 'nice-fns'
import type { RequestMiddleware } from '../middleware'

export function RequestReady() {
  const middleware: RequestMiddleware = {
    name: 'Builtin:RequestReady',
    priority: 100000,
    setup(ctx) {
      const { hooks, getOptions } = ctx

      hooks.hook('preface', async (params, ctx) => {
        const { ready = true } = getOptions()
        const value = await toValue(ready, params)
        if (!value) ctx.cancel(true)
      })
    },
  }

  return middleware
}

declare module '@rhao/request' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface RequestOptions<TData, TParams extends unknown[] = unknown[]> {
    /**
     * 执行是否就绪
     * @default true
     */
    ready?: MaybeFn<Awaitable<boolean>, [TParams]>
  }
}
