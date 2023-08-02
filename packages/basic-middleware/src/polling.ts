/* eslint-disable unused-imports/no-unused-vars */
import type { RequestMiddleware } from '@rhao/request'
import {
  assign,
  getVisibilityKeys,
  listenVisibilityChange,
  pauseableTimer,
  toValue,
} from '@rhao/request-utils'
import type { Fn, Getter, MaybeGetter } from 'types/utils'

export interface RequestPollingOptions {
  /**
   * 轮询间隔，单位为毫秒。如果值大于 0，则启动轮询模式
   * @default 0
   */
  interval?: MaybeGetter<number>
  /**
   * 在页面隐藏时，是否继续轮询。如果设置为 false，在页面隐藏时会暂时停止轮询，页面重新显示时继续上次轮询
   * @default true
   */
  whenHidden?: MaybeGetter<boolean>
  /**
   * 轮询错误重试次数。如果设置为 -1，则无限次
   * @default -1
   */
  errorRetryCount?: MaybeGetter<number>
}

export function RequestPolling(initialOptions?: Omit<RequestPollingOptions, 'interval'>) {
  const middleware: RequestMiddleware = {
    priority: -999,
    setup: (ctx) => {
      let polling = false
      ctx.mutateResult({ isPolling: () => polling })

      // 合并配置项
      const options = assign(
        { whenHidden: true, errorRetryCount: -1 } as RequestPollingOptions,
        initialOptions,
        { interval: 0 },
        ctx.getOptions().polling,
      ) as RequestPollingOptions

      // 禁用轮询
      if (!toValue(options.interval)) return

      const refresh = ctx.getResult().refresh

      // 创建计时器
      const timer = pauseableTimer(refresh, options.interval, {
        timerType: 'setTimeout',
        immediate: false,
      })

      const resume = () => {
        polling = true
        timer.resume()
      }
      const pause = () => {
        polling = false
        timer.pause()
      }

      // 监听页面显示和隐藏
      const { hidden: hiddenKey } = getVisibilityKeys()
      let removeListen: Fn | null = null
      const listen = () => {
        // 已经存在监听时则返回
        if (removeListen) return

        const stop = listenVisibilityChange((hidden) => {
          if (toValue(options.whenHidden!)) return
          if (hidden) {
            pause()
          } else {
            // 页面显示时立即轮询
            polling = true
            refresh()
          }
        })

        // 设置移除监听函数
        removeListen = () => {
          stop()
          removeListen = null
        }
      }
      ctx.hooks.hook('before', listen)

      // 取消时释放资源
      ctx.hooks.hook('cancel', () => {
        removeListen?.()
        pause()
      })

      // 包装恢复函数
      const handleResume = () => {
        // 页面隐藏且 "whenHidden" 为 "false" 时停止轮询
        if (!toValue(options.whenHidden!) && document[hiddenKey]) pause()
        else resume()
      }

      // 处理错误重试
      let count = 0
      const cleanAndResume = () => {
        // 清除次数记录
        count = 0
        handleResume()
      }

      ctx.hooks.hook('success', () => {
        cleanAndResume()
      })

      ctx.hooks.hook('error', () => {
        const retryCount = toValue(options.errorRetryCount!)
        if (retryCount === -1) return cleanAndResume()
        if (count < Math.abs(retryCount)) {
          count++
          handleResume()
        } else {
          // 达到指定次数时清除页面监听
          removeListen?.()
        }
      })
    },
  }

  return middleware
}

declare module '@rhao/request' {
  interface RequestCustomOptions<TData, TParams extends unknown[] = unknown[]> {
    polling?: RequestPollingOptions
  }

  interface RequestCustomResult<TData, TParams extends unknown[] = unknown[]> {
    isPolling: Getter<boolean>
  }
}
