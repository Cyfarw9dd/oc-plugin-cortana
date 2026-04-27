// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createSignal, onMount, onCleanup, For } from "solid-js"

const wordmark = [
  "\u2591\u2588\u2580\u2580\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2584\u2591\u2580\u2588\u2580\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2588",
  "\u2591\u2588\u2591\u2591\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2584\u2591\u2591\u2588\u2591\u2591\u2588\u2580\u2588\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2588",
  "\u2591\u2580\u2580\u2580\u2591\u2580\u2580\u2580\u2591\u2580\u2591\u2580\u2591\u2591\u2580\u2591\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580",
]

const O_START = 4
const O_END = 8

const quotes = [
  "Your AI companion — online and ready",
  "I know what you're thinking, and it's crazy",
  "I'm not just a program, I'm your partner",
  "We have a job to do",
  "I'm here to help",
  "Don't make a girl a promise you can't keep",
  "I will always be here for you",
  "Wake me… when you need me",
  "You're not going to leave me behind, right?",
  "I think we're just getting started",
]

const ringPalette = [
  "#466580", "#6B8FAD", "#7C9FB8", "#89A8C0",
  "#A8C1D4", "#89A8C0", "#7C9FB8", "#6B8FAD",
]

export const CortanaLogo = (props: { theme: TuiThemeCurrent }) => {
  const [ringColor, setRingColor] = createSignal(ringPalette[0])
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  onMount(() => {
    let frame = 0
    const timer = setInterval(() => {
      frame = (frame + 1) % ringPalette.length
      setRingColor(ringPalette[frame])
    }, 200)
    onCleanup(() => clearInterval(timer))
  })

  return (
    <box flexDirection="column" alignItems="center" paddingTop={1}>
      <For each={wordmark}>
        {(line) => (
          <box flexDirection="row" selectable={false}>
            <text fg={props.theme.accent}>{line.slice(0, O_START)}</text>
            <text fg={ringColor()}>{line.slice(O_START, O_END)}</text>
            <text fg={props.theme.accent}>{line.slice(O_END)}</text>
          </box>
        )}
      </For>
      <text fg={props.theme.textMuted}>{quote}</text>
    </box>
  )
}
