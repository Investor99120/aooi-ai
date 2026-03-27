/** 多模型路由：与前端 / 队列 job payload 共用 */
export type ModelId = "banana" | "flux_dev" | "flux_pro";

export type GenerateJobPayload = {
  model: ModelId;
  prompt: string;
  /** 宠物肖像等场景可传参考图 URL 或存储 key */
  imageUrl?: string;
};

export type ModelRouterResult = {
  model: ModelId;
  /** 临时 URL 或持久化后的 R2 key，由实现层约定 */
  outputUrl?: string;
  error?: string;
};
