// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent, TuiPlugin } from "@opencode-ai/plugin/tui"
import { createMemo, createSignal, Show } from "solid-js"

type Api = Parameters<TuiPlugin>[0]

const toNumber = (value: unknown): number => {
  if (typeof value !== "number") return 0
  return Number.isFinite(value) ? value : 0
}

const pct = (ratio: number): string => {
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100) + "%"
}

const fmt = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 10_000) return Math.round(n / 1_000) + "K"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return String(n)
}

const fmtCaps = (n: number): string => {
  return "$" + n.toFixed(2)
}

const bar = (ratio: number, width: number): string => {
  const r = Math.max(0, Math.min(1, ratio))
  const size = Math.max(1, width)
  const n = Math.round(r * size)
  return "\u2588".repeat(n) + "\u2591".repeat(size - n)
}

const fillWidth = (width: number, ...parts: string[]): number => {
  return Math.max(1, width - parts.reduce((sum, part) => sum + part.length, 0) - 2)
}

export const CortanaContext = (props: {
  theme: TuiThemeCurrent
  api: Api
  sessionId: string
}) => {
  const [barWidth, setBarWidth] = createSignal(12)

  const data = createMemo(() => {
    const messages = props.api.state.session.messages(props.sessionId)
    let totalOutput = 0
    let totalCost = 0
    let lastInput = 0
    let lastCacheRead = 0
    let lastModelID = ""
    let lastProviderID = ""

    for (const [idx, msg] of messages.entries()) {
      if (msg.role !== "assistant") continue
      const input = toNumber(msg.tokens.input)
      const output = toNumber(msg.tokens.output)
      const cacheRead = toNumber(msg.tokens.cache.read)
      const cost = toNumber(msg.cost)
      totalOutput += output
      totalCost += cost
      if (!msg.providerID || !msg.modelID) continue
      if (input <= 0 && output <= 0) continue
      lastInput = input
      lastCacheRead = cacheRead
      lastModelID = msg.modelID
      lastProviderID = msg.providerID
    }
    const contextUsed = lastInput + lastCacheRead

    let contextLimit = 0
    let outputLimit = 0
    for (const provider of props.api.state.provider) {
      const model = provider.id === lastProviderID
        ? provider.models[lastModelID]
        : undefined
      if (model) {
        contextLimit = model.limit.context
        outputLimit = model.limit.output
        break
      }
    }
    if (!contextLimit && lastModelID) {
      for (const provider of props.api.state.provider) {
        const model = provider.models[lastModelID]
        if (model) {
          contextLimit = model.limit.context
          outputLimit = model.limit.output
          break
        }
      }
    }

    const contextRatio = contextLimit > 0 ? Math.min(1, contextUsed / contextLimit) : 0
    const outputRatio = outputLimit > 0 ? Math.min(1, totalOutput / outputLimit) : 0
    const hasData = contextUsed > 0 || totalOutput > 0

    return { contextUsed, totalOutput, totalCost, contextLimit, outputLimit,
             contextRatio, outputRatio, hasData }
  })

  const ctxColor = createMemo(() => {
    const r = data().contextRatio
    if (r > 0.9) return props.theme.error
    if (r > 0.7) return props.theme.warning
    return props.theme.primary
  })

  const ctxInfo = createMemo(() => `${fmt(data().contextUsed)} / ${fmt(data().contextLimit)} tokens`)
  const ctxPct = createMemo(() => ` ${pct(data().contextRatio)}`)

  return (
    <Show when={data().hasData}>
      <box
        onSizeChange={function () {
          const next = Math.max(1, this.width)
          setBarWidth((prev) => (prev === next ? prev : next))
        }}
        paddingTop={1}
        width="100%"
        flexDirection="column"
      >
        <Show when={data().contextLimit > 0}>
          <text>
            <span style={{ fg: props.theme.textMuted }}>SHIELD </span>
            <span style={{ fg: ctxColor() }}>
              [{bar(data().contextRatio, fillWidth(barWidth(), "SHIELD ", ctxPct()))}]
            </span>
            <span style={{ fg: props.theme.text }}>{ctxPct()}</span>
          </text>
          <text fg={props.theme.textMuted}>{ctxInfo()}</text>
        </Show>
        <text>
          <span style={{ fg: props.theme.textMuted }}>COST   </span>
          <span style={{ fg: props.theme.text }}>{fmtCaps(data().totalCost)}</span>
        </text>
      </box>
    </Show>
  )
}
