import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "@/db/schema";

// Per-request Drizzle client (required for Cloudflare Workers)
// React's cache() ensures the same instance is reused within a single request
export const getDb = cache(() => {
	const { env } = getCloudflareContext();
	return drizzle(env.DB, { schema });
});
