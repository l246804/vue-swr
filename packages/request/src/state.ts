import type { Nullish } from '@rhao/types-base'
import type { RequestOptions } from './options'

/**
 * request state
 */
export interface RequestState<TData, TParams extends unknown[] = unknown[]> {
  /**
   * 执行时的参数
   */
  params: TParams
  /**
   * 执行后的数据
   */
  data: TData | Nullish
  /**
   * 执行失败后的错误
   */
  error: (Error & { cause?: any }) | Nullish
  /**
   * 是否正在执行，多次执行仅会在初次和全部执行结束后触发更新
   */
  loading: boolean
}

export function createState(options: RequestOptions<any, any[]>) {
  return {
    params: [],
    data: options.initData?.(),
    error: undefined,
    loading: false,
  } as RequestState<any, any[]>
}
