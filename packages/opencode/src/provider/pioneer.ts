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
    // Remove short timeout signals -- pioneer-server manages timeouts
    if (init?.signal) {
      delete init.signal
    }

    return originalFetch(input, init)
  }

  return createOpenAICompatible({
    name: options.name || "pioneer",
    baseURL,
    apiKey,
    ...options,
    fetch: pioneerFetch,
  })
}
