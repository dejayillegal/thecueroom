import React from "react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="loading-pulse">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-primary-foreground rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
