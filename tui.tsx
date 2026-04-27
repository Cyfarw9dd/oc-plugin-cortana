// @ts-nocheck
/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { CortanaLogo } from "./logo"
import { CortanaContext } from "./context"

const id = "cortana"

const rec = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return
  return Object.fromEntries(Object.entries(value)) as Record<string, unknown>
}

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value !== "boolean" ? fallback : value

const tui: TuiPlugin = async (api, options) => {
  const opts = rec(options)
  if (!bool(opts?.enabled, true)) return

  // Install both themes into native OpenCode theme list
  await api.theme.install("./cortana.json")
  await api.theme.install("./weapon.json")

  // Apply default on first run if set_theme enabled
  if (bool(opts?.set_theme, true) && !api.kv.get("cortana.booted")) {
    api.theme.set("cortana")
    api.kv.set("cortana.booted", true)
  }

  await api.plugins.deactivate("internal:sidebar-context")

  api.slots.register({
    slots: {
      home_logo(ctx) {
        return <CortanaLogo theme={ctx.theme.current} />
      },
    },
  })

  api.slots.register({
    order: 50,
    slots: {
      sidebar_content(ctx, input) {
        return (
          <CortanaContext
            theme={ctx.theme.current}
            api={api}
            sessionId={input.session_id}
          />
        )
      },
    },
  })

  api.lifecycle.onDispose(async () => {
    await api.plugins.activate("internal:sidebar-context")
  })
}

const plugin: TuiPluginModule & { id: string } = { id, tui }
export default plugin
