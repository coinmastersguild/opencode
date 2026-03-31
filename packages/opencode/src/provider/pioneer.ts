/**
 * Pioneer Provider — integration with Pioneer Server's unified inference API.
 *
 * Uses streaming (required by AI SDK) but with extended timeouts for reasoning models
 * that may take 30-60s before producing the first token.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

export function createPioneer(options: Record<string, any> = {}) {
  const baseURL = options.baseURL || "http://localhost:9100/api/v1"
  const apiKey = options.apiKey || "dummy-dev"

  // Wrap fetch to remove any abort signals with short timeouts
  // Reasoning models need 60-120s before first token
  const originalFetch = options.fetch ?? globalThis.fetch

  const pioneerFetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : input?.url || "unknown"
    if (url.includes("/chat/completions")) {
      try {
        const body = JSON.parse(init?.body || "{}")
        console.error(`[pioneer-fetch] model=${body.model} stream=${body.stream} tools=${body.tools?.length || 0}`)
      } catch {}
    }

    // Remove abort signals -- reasoning models need minutes, not seconds
    if (init?.signal) {
      delete init.signal
    }

    return originalFetch(input, init)
  }

  // Spread options first, then override with our values (order matters!)
  const { fetch: _discardFetch, baseURL: _b, apiKey: _a, name: _n, ...rest } = options
  return createOpenAICompatible({
    ...rest,
    name: options.name || "pioneer",
    baseURL,
    apiKey,
    fetch: pioneerFetch,
  })
}
