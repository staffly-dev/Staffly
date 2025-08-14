"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Copy({ 
  content, 
  className,
  ...props 
}: { 
  content: string;
  className?: string;
} & React.HTMLAttributes<HTMLButtonElement>) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  return (
    <Button 
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn(
        "h-7 w-7 p-1.5 rounded-md",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-muted/50",
        "transition-colors duration-200",
        className
      )}
      aria-label={isCopied ? "Copied!" : "Copy to clipboard"}
      title="Copy to clipboard"
      {...props}
    >
      {isCopied ? (
        <CheckIcon className="w-3.5 h-3.5" />
      ) : (
        <CopyIcon className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
