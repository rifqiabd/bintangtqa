import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nama, limit } = await req.json();

    if (!nama) {
      return new Response(JSON.stringify({ error: "Missing 'nama' parameter" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const apiUrl = new URL("https://sekolah.devapi.id/sekolah");
    apiUrl.searchParams.set("nama", nama);
    if (limit) {
      apiUrl.searchParams.set("limit", limit.toString());
    }

    console.log("Fetching from:", apiUrl.toString());

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
