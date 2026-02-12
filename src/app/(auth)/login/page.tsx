import { signIn } from "@/lib/auth";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-sm space-y-6 px-4">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Cortex</h1>
					<p className="text-sm text-muted-foreground">Your brain&apos;s command centre</p>
				</div>
				<form
					action={async () => {
						"use server";
						await signIn("google", { redirectTo: "/" });
					}}
				>
					<button
						type="submit"
						className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
					>
						Sign in with Google
					</button>
				</form>
			</div>
		</div>
	);
}
