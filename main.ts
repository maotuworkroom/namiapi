import { serve } from "https://deno.land/std/http/server.ts";

const NAMI_API = "https://www.n.cn/api/conversation/";

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  
  if (!query) {
    return new Response("Missing query parameter 'q'", { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${NAMI_API}${query}`);
    const data = await apiResponse.json();
    const result = data.data.message_list[0].result;

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
