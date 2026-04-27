// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent, TuiPlugin } from "@opencode-ai/plugin/tui"
import { createSignal, onMount, onCleanup, For } from "solid-js"

type Api = Parameters<TuiPlugin>[0]

const O_GLYPHS = [
  "░█▀█",
  "░█░█",
  "░▀▀▀",
]

const ringPalette = [
  "#466580", "#6B8FAD", "#7C9FB8", "#89A8C0",
  "#A8C1D4", "#89A8C0", "#7C9FB8", "#6B8FAD",
]

const STATUS_POLL_MS = 800

export const SidebarO = (props: {
  theme: TuiThemeCurrent
  api: Api
  sessionId: string
}) => {
  const [color, setColor] = createSignal<string | undefined>(undefined)
  let animTimer: ReturnType<typeof setInterval> | undefined
  let wasBusy = false

  const startAnimation = () => {
    if (animTimer) return
    let frame = 0
    animTimer = setInterval(() => {
      frame = (frame + 1) % ringPalette.length
      setColor(ringPalette[frame])
    }, 200)
  }

  const stopAnimation = () => {
    if (animTimer) {
      clearInterval(animTimer)
      animTimer = undefined
    }
    setColor(undefined)
  }

  onMount(() => {
    const poll = setInterval(() => {
      const status = props.api.state.session.status(props.sessionId)
      const busy = status?.type === "busy"

      if (busy && !wasBusy) startAnimation()
      else if (!busy && wasBusy) stopAnimation()
      wasBusy = busy
    }, STATUS_POLL_MS)

    onCleanup(() => {
      clearInterval(poll)
      stopAnimation()
    })
  })

  return (
    <box flexDirection="column" selectable={false}>
      <For each={O_GLYPHS}>
        {(line) => <text fg={color() ?? props.theme.accent}>{line}</text>}
      </For>
    </box>
  )
}
