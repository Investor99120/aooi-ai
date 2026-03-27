import { NextResponse } from "next/server";
import type { ModelId } from "@/lib/ai/types";

const ALLOWED: ModelId[] = ["banana", "flux_dev", "flux_pro"];

type Body = {
  model?: string;
  prompt?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_JSON", message: "请求体不是合法 JSON。" },
      { status: 400 },
    );
  }

  const model = body.model as ModelId | undefined;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!model || !ALLOWED.includes(model)) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_MODEL",
        message: "请选择有效模型。",
      },
      { status: 400 },
    );
  }

  if (!prompt || prompt.length > 4000) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_PROMPT",
        message: "请填写提示词（1–4000 字）。",
      },
      { status: 400 },
    );
  }

  // 快速开图：仅 banana 在此通道开放占位；高清需在业务层校验加购后再调 flux
  if (model !== "banana") {
    return NextResponse.json(
      {
        ok: false,
        code: "PURCHASE_REQUIRED",
        message: "高清模型需先加购。请前往定价页购买高清包或订阅。",
      },
      { status: 402 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      code: "QUEUE_NOT_CONFIGURED",
      message:
        "快速开图接口已接通占位：队列、fal.ai 与存储配置完成后将返回任务 ID。当前为开发中响应。",
      preview: { model, promptLength: prompt.length },
    },
    { status: 503 },
  );
}
