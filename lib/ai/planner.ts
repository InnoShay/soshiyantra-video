import { UserBrief, ProductionPlan, ProductionPlanSchema } from '../validation/schemas'
import mockPlanData from '../fixtures/mockPlan.json'

export interface StoryPlanner {
  createProductionPlan(input: UserBrief): Promise<ProductionPlan>
}

export class MockStoryPlanner implements StoryPlanner {
  async createProductionPlan(input: UserBrief): Promise<ProductionPlan> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Parse the fixture through Zod to ensure it matches the contract exactly
    // In a real scenario, this would use an LLM output
    const plan = ProductionPlanSchema.parse(mockPlanData)
    
    // Customize the plan slightly based on the input to feel "real"
    plan.normalizedBrief = {
      ...plan.normalizedBrief,
      ...input
    }
    
    return plan
  }
}
