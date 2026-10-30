import { AiError, type ProviderResult } from '../types'
import { MAX_OUTPUT_TOKENS } from '../defaults'
import {
  mergeConsecutive,
  normalizeUsage,
  providerHttpError,
  toNetworkError,
  type ProviderArgs,
} from './shared'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const BUILTIN_AI_URL = 'https://text.pollinations.ai/openai/chat/completions'

interface OpenAiResponse {
  choices?: { message?: { content?: string } }[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

/**
 * Call OpenAI's Chat Completions endpoint with the caller's own key,
 * or fallback smoothly to the built-in free LLM provider.
 */
export async function generateOpenAi(args: ProviderArgs): Promise<ProviderResult> {
  const { apiKey, model, systemPrompt, messages, timeoutMs } = args

  const isBuiltIn = !apiKey || apiKey === 'jeose-built-in' || !apiKey.startsWith('sk-')
  const endpoint = isBuiltIn ? BUILTIN_AI_URL : OPENAI_URL
  const requestModel = isBuiltIn ? 'openai' : model

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (!isBuiltIn) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: requestModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...mergeConsecutive(messages),
        ],
        max_completion_tokens: MAX_OUTPUT_TOKENS,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    // If custom OpenAI key fails with 401, 403, 404, 429, fall back to built-in endpoint
    if (!res.ok && !isBuiltIn) {
      console.warn(`[OpenAI] Status ${res.status}. Falling back to built-in AI engine.`);
      res = await fetch(BUILTIN_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: systemPrompt },
            ...mergeConsecutive(messages),
          ],
          max_completion_tokens: MAX_OUTPUT_TOKENS,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      })
    }
  } catch (err) {
    if (!isBuiltIn) {
      try {
        res = await fetch(BUILTIN_AI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemPrompt },
              ...mergeConsecutive(messages),
            ],
            max_completion_tokens: MAX_OUTPUT_TOKENS,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        })
      } catch {
        throw toNetworkError(err)
      }
    } else {
      throw toNetworkError(err)
    }
  }

  if (!res.ok) {
    throw await providerHttpError('OpenAI', res)
  }

  const data = (await res.json().catch(() => null)) as OpenAiResponse | null
  let text = data?.choices?.[0]?.message?.content
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new AiError('AI returned an empty response.', {
      code: 'empty_response',
    })
  }

  // Strip any reasoning / think tags if returned by reasoning models
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  const usage = normalizeUsage({
    prompt: data?.usage?.prompt_tokens,
    completion: data?.usage?.completion_tokens,
    total: data?.usage?.total_tokens,
  })
  return { text, usage }
}
