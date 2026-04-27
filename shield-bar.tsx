// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createMemo, createSignal, Show } from "solid-js"

export type ShieldBarData = {
  ratio: number
  label: string
  limit: number
  used: number
  color?: string
}

const shieldBar = (ratio: number, width: number): string => {
  const r = Math.max(0, Math.min(1, ratio))
  const size = Math.max(1, width)
  const n = Math.round(r * size)
  const filled = "\u2588".repeat(n)
  const empty = "\u2591".repeat(size - n)
  const segmentGap = (s: string): string => {
    return s.replace(/(.{4})/g, "$1 ").trimEnd()
  }
  return segmentGap(filled + empty)
}

export const ShieldBar = (props: {
  theme: TuiThemeCurrent
  data: ShieldBarData
}) => {
  const [barWidth, setBarWidth] = createSignal(16)

  const pctStr = createMemo(() => {
    return Math.round(Math.max(0, Math.min(1, props.data.ratio)) * 100) + "%"
  })

  const barColor = createMemo(() => {
    if (props.data.color) return props.data.color
    const r = props.data.ratio
    if (r > 0.9) return props.theme.error
    if (r > 0.7) return props.theme.warning
    return props.theme.primary
  })

  const fillWidth = createMemo(() => {
    const labelLen = props.data.label.length + 2
    const pctLen = pctStr().length + 1
    return Math.max(4, barWidth() - labelLen - pctLen - 4)
  })

  return (
    <Show when={props.data.limit > 0}>
      <box flexDirection="row" alignItems="center"
        onSizeChange={function () {
          setBarWidth(Math.max(1, this.width))
        }}
      >
        <text>
          <span style={{ fg: props.theme.textMuted }}>{props.data.label} </span>
          <span style={{ fg: barColor() }}>
            [{shieldBar(props.data.ratio, fillWidth())}]
          </span>
          <span style={{ fg: props.theme.text }}> {pctStr()}</span>
        </text>
      </box>
      <text fg={props.theme.textMuted}>
        {props.data.used} / {props.data.limit} tokens
      </text>
    </Show>
  )
}

export const fmtTokens = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 10_000) return Math.round(n / 1_000) + "K"
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K"
  return String(n)
}

export const fmtCost = (n: number): string => {
  if (n >= 1) return "$" + n.toFixed(2)
  if (n >= 0.01) return "$" + n.toFixed(3)
  return "$" + n.toFixed(4)
}
