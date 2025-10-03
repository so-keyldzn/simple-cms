/**
 * TiptapRenderer - Composant pour afficher le contenu HTML de Tiptap
 *
 * Utilise la classe .tiptap-content pour appliquer les mêmes styles
 * que dans l'éditeur, garantissant une cohérence visuelle.
 *
 * @example
 * ```tsx
 * <TiptapRenderer content={post.content} />
 * ```
 */

import { cn } from "@/lib/utils";

interface TiptapRendererProps {
  content: string;
  className?: string;
}

export function TiptapRenderer({ content, className }: TiptapRendererProps) {
  return (
    <div
      className={cn("tiptap-content prose prose-lg dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
