import NextAuth from "next-auth";
import { D1Adapter } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
	const { env } = await getCloudflareContext({ async: true });

	return {
		providers: [
			Google({
				clientId: env.AUTH_GOOGLE_ID,
				clientSecret: env.AUTH_GOOGLE_SECRET,
				authorization: {
					params: {
						scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
						access_type: "offline",
						prompt: "consent",
					},
				},
			}),
		],
		adapter: D1Adapter(env.DB),
		callbacks: {
			async session({ session, user }) {
				session.user.id = user.id;
				return session;
			},
			async signIn({ account }) {
				// Store the Gmail tokens in the account record (handled by adapter)
				return true;
			},
		},
	};
});
