import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const assistantId = searchParams.get("assistantId");  
  const openai = new OpenAI();

  if (!assistantId)
  return Response.json({ error: "Assistant Not Found!" }, { status: 400 });

  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);

    console.log(assistant);

    return Response.json({ assistant: assistant });
  } catch (e) {
    console.log(e);
    return Response.json({ error: e });
  }
}
