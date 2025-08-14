import { ComponentProps, ReactNode } from "react";
import Copy from "./copy";
import { cn } from "@/lib/utils";
import { File, FileText, FileCode, FileJson, Terminal, FileCode2 } from "lucide-react";

interface PreProps extends ComponentProps<"pre"> {
  raw?: string;
  fileName?: string;
  language?: string;
  children?: ReactNode;
}

export default function Pre({
  children,
  raw,
  className = "",
  fileName,
  language,
  ...rest
}: PreProps) {
  // Extract language from class name (format: language-js, language-tsx, etc.)
  const langClass = className.match(/language-(\w+)/);
  const detectedLanguage = language || (langClass ? langClass[1] : 'text');
  const hasHeader = !!fileName || !!detectedLanguage;

  return (
    <div className="group relative my-6 rounded-lg border border-border/50 bg-card shadow-sm overflow-hidden">
      {hasHeader && (
        <div className="flex items-center h-8 px-4 py-1.5 text-xs border-b border-border/50 bg-muted/30 text-muted-foreground dark:bg-muted/50">
          <div className="flex items-center">
            <FileIcon language={detectedLanguage} />
            <span className="ml-2 truncate">{fileName}</span>
          </div>
          {detectedLanguage && (
            <span className="ml-auto text-xs font-mono text-muted-foreground/70">
              {detectedLanguage}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Copy content={raw!} />
        </div>
        <pre
          className={cn(
            "font-mono text-sm overflow-x-auto p-4",
            "bg-card text-foreground",
            "dark:bg-muted/20",
            !hasHeader && "rounded-lg",
            hasHeader ? "pt-2" : "py-4",
            className
          )}
          {...rest}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}

// Simple file icon component based on language
function FileIcon({ language }: { language?: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    js: <FileCode className="w-3.5 h-3.5" />,
    javascript: <FileCode className="w-3.5 h-3.5" />,
    ts: <FileCode2 className="w-3.5 h-3.5" />,
    typescript: <FileCode2 className="w-3.5 h-3.5" />,
    jsx: <FileCode className="w-3.5 h-3.5" />,
    tsx: <FileCode2 className="w-3.5 h-3.5" />,
    json: <FileJson className="w-3.5 h-3.5" />,
    md: <FileText className="w-3.5 h-3.5" />,
    mdx: <FileText className="w-3.5 h-3.5" />,
    sh: <Terminal className="w-3.5 h-3.5" />,
    bash: <Terminal className="w-3.5 h-3.5" />,
    default: <File className="w-3.5 h-3.5" />
  };

  const Icon = language ? iconMap[language.toLowerCase()] || iconMap.default : iconMap.default;

  return <>{Icon}</>;
}
