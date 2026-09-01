import { z } from 'zod'

export const UserBriefSchema = z.object({
  topic: z.string().min(1),
  objective: z.string().optional(),
  audience: z.string().optional(),
  tone: z.string().optional(),
  style: z.string().optional(),
  durationSeconds: z.number().int().positive(),
  platform: z.string().optional(),
  cta: z.string().optional(),
  language: z.string().optional()
})

export type UserBrief = z.infer<typeof UserBriefSchema>

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  appearance: z.object({
    age: z.number().optional(),
    hair: z.string().optional(),
    clothing: z.string().optional(),
    build: z.string().optional()
  }).optional(),
  personality: z.string().optional(),
  consistencyAnchors: z.array(z.string())
})

export type Character = z.infer<typeof CharacterSchema>

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  architecture: z.string().optional(),
  palette: z.string().optional(),
  lighting: z.string().optional(),
  recurringProps: z.array(z.string()).optional(),
  timeOfDay: z.string().optional()
})

export type Location = z.infer<typeof LocationSchema>

export const SceneSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  durationSeconds: z.number().int().positive(),
  purpose: z.string(),
  locationId: z.string(),
  characterIds: z.array(z.string()),
  action: z.string(),
  camera: z.string(),
  lighting: z.string(),
  composition: z.string().optional(),
  visualPrompt: z.string(),
  negativePrompt: z.string().optional(),
  dialogue: z.string().optional(),
  voiceover: z.string().optional(),
  transition: z.string().optional(),
  requiredAssets: z.array(z.string()).optional()
})

export type Scene = z.infer<typeof SceneSchema>

export const ProductionPlanSchema = z.object({
  normalizedBrief: UserBriefSchema,
  title: z.string(),
  hook: z.string(),
  storyArc: z.object({
    setup: z.string(),
    conflict: z.string(),
    escalation: z.string().optional(),
    resolution: z.string()
  }),
  characters: z.array(CharacterSchema),
  locations: z.array(LocationSchema),
  scenes: z.array(SceneSchema),
  voiceoverDirection: z.string().optional(),
  musicDirection: z.string().optional(),
  outputSpecification: z.object({
    aspectRatio: z.string(),
    targetDuration: z.number()
  }).optional()
})

export type ProductionPlan = z.infer<typeof ProductionPlanSchema>
