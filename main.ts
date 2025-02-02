import { serve } from "https://deno.land/std/http/server.ts";

const NAMI_API = "https://www.n.cn/api/conversation/";

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  
  if (!query) {
    return new Response("Missing query parameter 'q'", { status: 400 });
  }

  try {
    // 第一步: 获取会话ID
    const searchResponse = await fetch(`https://www.n.cn/search/${query}`);
    const html = await searchResponse.text();
    const conversationId = html.match(/conversation_id":"([^"]+)/)?.[1];

    if (!conversationId) {
      return new Response("Failed to get conversation ID", { status: 500 });
    }

    // 第二步: 获取回答
    const apiResponse = await fetch(`${NAMI_API}${conversationId}?version=20&invite=1`);
    const data = await apiResponse.json();

    // 提取回答文本
    const result = data.data.message_list[0].result;

    // 设置CORS头
    const headers = new Headers({
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });

    return new Response(result, { headers });

  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

const port = 8000;
console.log(`Server running on http://localhost:${port}`);

await serve(handleRequest, { port });
