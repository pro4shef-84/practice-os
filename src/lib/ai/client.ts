import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  // Full analysis: weekly digest, at-risk explanations, financial narratives
  sonnet: 'claude-sonnet-4-5',
  // Fast classification: pattern labels, short summaries, tooltips
  haiku: 'claude-haiku-4-5',
} as const

export type Model = (typeof MODELS)[keyof typeof MODELS]
