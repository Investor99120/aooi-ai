import type { GenerateJobPayload, ModelId, ModelRouterResult } from "./types";

/**
 * 多模型路由入口：Worker / Route Handler 只调这一条，避免散落在 if-else。
 * TODO: 接入 fal.ai 等具体 SDK，按 model 调用不同 endpoint。
 */
export async function routeGenerate(
  payload: GenerateJobPayload,
): Promise<ModelRouterResult> {
  const { model } = payload;

  switch (model as ModelId) {
    case "banana":
      // await callBanana(payload)
      break;
    case "flux_dev":
      // await callFluxDev(payload)
      break;
    case "flux_pro":
      // await callFluxPro(payload)
      break;
    default:
      return {
        model: payload.model,
        error: `Unsupported model: ${String(payload.model)}`,
      };
  }

  return {
    model: payload.model,
    error:
      "Model adapters not wired yet — connect fal.ai / queue worker to implement.",
  };
}
