import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import Focus from "@tiptap/extension-focus";
import { DragHandle } from "@tiptap/extension-drag-handle";
import { useEffect, useRef } from "react";

import { ImageExtension } from "@/components/extensions/image";
import { ImagePlaceholderEnhanced } from "@/components/extensions/image-placeholder-enhanced";
import { SearchAndReplace } from "@/components/extensions/search-and-replace";
import { YoutubeExtension } from "@/components/extensions/youtube";
import { ToolbarProvider } from "@/components/toolbars/toolbar-provider";
import { BoldToolbar } from "@/components/toolbars/bold";
import { ItalicToolbar } from "@/components/toolbars/italic";
import { UnderlineToolbar } from "@/components/toolbars/underline";
import { StrikeThroughToolbar } from "@/components/toolbars/strikethrough";
import { CodeToolbar } from "@/components/toolbars/code";
import { BulletListToolbar } from "@/components/toolbars/bullet-list";
import { OrderedListToolbar } from "@/components/toolbars/ordered-list";
import { BlockquoteToolbar } from "@/components/toolbars/blockquote";
import { CodeBlockToolbar } from "@/components/toolbars/code-block";
import { HorizontalRuleToolbar } from "@/components/toolbars/horizontal-rule";
import { UndoToolbar } from "@/components/toolbars/undo";
import { RedoToolbar } from "@/components/toolbars/redo";
import { ColorHighlightToolbar } from "@/components/toolbars/color-and-highlight";
import { SearchAndReplaceToolbar } from "@/components/toolbars/search-and-replace-toolbar";
import { ImagePlaceholderToolbar } from "@/components/toolbars/image-placeholder-toolbar";
import { SubscriptToolbar } from "@/components/toolbars/subscript";
import { SuperscriptToolbar } from "@/components/toolbars/superscript";
import { YoutubeToolbar } from "@/components/toolbars/youtube";
import { HeadingToolbar } from "@/components/toolbars/heading";
import { LinkToolbar } from "@/components/toolbars/link";
import { TextAlignToolbar } from "@/components/toolbars/text-align";
import { TableToolbar } from "@/components/toolbars/table";
import { TaskListToolbar } from "@/components/toolbars/task-list";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BubbleMenu } from "@/components/ui/bubble-menu";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: number;
}

// Normalize HTML for comparison - keeps ProseMirror breaks but normalizes formatting

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
  editable = true,
  className = "",
  minHeight = 400,
}: RichTextEditorProps) {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none ${className}`,
        style: `min-height: ${minHeight}px`,
      },
    },
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
        },
        dropcursor: {
          color: "hsl(var(--primary))",
          width: 2,
        },
      }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose pl-2 my-2",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2 my-1",
        },
      }),
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "tiptap-table-row",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "tiptap-table-header",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "tiptap-table-cell",
        },
      }),
      ImageExtension,
      ImagePlaceholderEnhanced.configure({
        onDrop: (files, editor) => {
          // Only handle external file drops, not internal drags
          if (files && files.length > 0) {
            files.forEach((file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                editor.chain().focus().setImage({ src }).run();
              };
              reader.readAsDataURL(file);
            });
          }
        },
        onEmbed: (url, editor) => {
          // Handle URL embed
          editor.chain().focus().setImage({ src: url }).run();
        },
      }),
      SearchAndReplace,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Typography,
      Focus.configure({
        className: "has-focus",
        mode: "all",
      }),
      YoutubeExtension.configure({
        controls: true,
        nocookie: true,
      }),
      DragHandle.configure({
        render: () => {
          const element = document.createElement('div');
          element.classList.add('drag-handle');
          element.innerHTML = `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 9h16.5m-16.5 6.75h16.5"
              />
            </svg>
          `;
          return element;
        },
      }),
    ],
    content,
    editable,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isInternalUpdate.current) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Handle editor updates and call onChange
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      onChange(html);
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, onChange]);

  if (!editor) {
    return null;
  }

  return (
    <TooltipProvider>
      <ToolbarProvider editor={editor}>
        <div className="border rounded-lg">
          {/* Toolbar */}
          <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 rounded-t-lg">
            {/* Heading */}
            <HeadingToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Text Align */}
            <TextAlignToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Text Formatting */}
            <BoldToolbar />
            <ItalicToolbar />
            <UnderlineToolbar />
            <StrikeThroughToolbar />
            <CodeToolbar />
            <SubscriptToolbar />
            <SuperscriptToolbar />
            <LinkToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Lists */}
            <BulletListToolbar />
            <OrderedListToolbar />
            <TaskListToolbar />
            <BlockquoteToolbar />
            <CodeBlockToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Insert */}
            <HorizontalRuleToolbar />
            <TableToolbar />
            <ImagePlaceholderToolbar />
            <YoutubeToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Colors */}
            <ColorHighlightToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Search & Replace */}
            <SearchAndReplaceToolbar />

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* History */}
            <UndoToolbar />
            <RedoToolbar />
          </div>

          {/* Bubble Menu */}
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex gap-1 p-1 bg-background border rounded-lg shadow-lg">
              <HeadingToolbar />
              <Separator orientation="vertical" className="h-8 mx-1 " />
              <TextAlignToolbar />

              <BoldToolbar />
              <ItalicToolbar />
              <UnderlineToolbar />
              <StrikeThroughToolbar />
              <LinkToolbar />
            </div>
          </BubbleMenu>

          {/* Editor Content */}
          <EditorContent
            editor={editor}
            className="bg-background relative overflow-visible"
          />

          {/* Footer with character count */}
          <div className="border-t bg-muted/30 px-4 py-2 flex justify-end text-xs text-muted-foreground rounded-b-lg">
            {editor.storage.characterCount.characters()} caractères ·{" "}
            {editor.storage.characterCount.words()} mots
          </div>
        </div>
      </ToolbarProvider>
    </TooltipProvider>
  );
}
