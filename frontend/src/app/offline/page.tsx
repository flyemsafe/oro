import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-xl border-border">
        <CardHeader className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-6 w-6 text-oro-orange-500" />
          </div>
          <CardTitle>You Are Offline</CardTitle>
          <CardDescription>
            Oro could not reach the network. Browsing cached pages may still work, but parsing with LiteLLM and saving new prompts require a live connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/prompts/new">Open Prompt Draft</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
