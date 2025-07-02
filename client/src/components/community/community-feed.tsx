import { Suspense } from "react";
import PostFeed from "@/components/posts/post-feed";
import PostComposer from "@/components/posts/post-composer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CommunityFeed() {
  return (
    <div className="space-y-6">
      {/* Post Composer */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <PostComposer />
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Community Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Community Posts
          </h2>
          <div className="text-sm text-muted-foreground">
            Latest posts from the community
          </div>
        </div>
        
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <PostFeed />
        </Suspense>
      </div>
    </div>
  );
}