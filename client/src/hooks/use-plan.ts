import { useMutation } from "@tanstack/react-query";
import { api, type PlanGenerationInput, type PlanGenerationResponse } from "@shared/routes";

export function useGeneratePlan() {
  return useMutation({
    mutationFn: async (data: PlanGenerationInput) => {
      const res = await fetch(api.ai.generatePlan.path, {
        method: api.ai.generatePlan.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate plan");
      }
      
      return api.ai.generatePlan.responses[200].parse(await res.json());
    },
  });
}
