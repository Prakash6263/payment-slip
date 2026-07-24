import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getMcpSupabase } from "../supabase";

export default defineTool({
  name: "list_relieving_letters",
  title: "List relieving letters",
  description: "List saved relieving letters (most recent first).",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, search }) => {
    const supabase = getMcpSupabase();
    let q = supabase.from("relieving_letters").select("*").order("created_at", { ascending: false }).limit(limit ?? 25);
    if (search) q = q.ilike("employee_name", `%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { rows: data } };
  },
});