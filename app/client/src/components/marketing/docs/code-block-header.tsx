import { FileText, FileCode, FileJson, FileTerminal, FileType, FileCode2, FileArchive, FileImage, FileVideo, FileAudio, FileSpreadsheet, File, FileCheck2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const languageIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  js: FileCode,
  javascript: FileCode,
  ts: FileCode2,
  typescript: FileCode2,
  jsx: FileCode,
  tsx: FileCode2,
  json: FileJson,
  md: FileText,
  mdx: FileText,
  sh: FileTerminal,
  bash: FileTerminal,
  txt: FileType,
  zip: FileArchive,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  webp: FileImage,
  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
  mp3: FileAudio,
  wav: FileAudio,
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
};

export function CodeBlockHeader({
  fileName,
  language,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  fileName?: string;
  language?: string;
}) {
  const Icon = language && languageIcons[language.toLowerCase()] ? 
    languageIcons[language.toLowerCase()] : File;
  
  return (
    <div 
      className={cn(
        "flex items-center h-8 px-4 py-1.5 text-xs border-b border-border/50 bg-muted/30 text-muted-foreground rounded-t-lg",
        "dark:bg-muted/50",
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5 mr-2" />
      <span className="truncate">{fileName || 'code'}</span>
      {language && (
        <span className="ml-auto text-xs font-mono text-muted-foreground/70">
          {language}
        </span>
      )}
    </div>
  );
}
