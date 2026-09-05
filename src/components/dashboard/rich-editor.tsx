"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import { uploadToMedia } from "@/lib/upload";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";

function Btn({
  on,
  active,
  label,
  children,
}: {
  on: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg text-sm transition ${
        active ? "bg-brand-500/20 text-brand-200" : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("رابط:", prev ?? "https://");
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToMedia(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 p-1.5">
      <Btn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="غامق">
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="مائل">
        <Italic className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Btn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="عنوان 2">
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="عنوان 3">
        <Heading3 className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Btn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="قائمة نقطية">
        <List className="h-4 w-4" />
      </Btn>
      <Btn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="قائمة مرقّمة">
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="اقتباس">
        <Quote className="h-4 w-4" />
      </Btn>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Btn on={setLink} active={editor.isActive("link")} label="رابط">
        <LinkIcon className="h-4 w-4" />
      </Btn>
      <Btn on={() => fileRef.current?.click()} active={uploading} label="رفع صورة">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </Btn>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Btn on={() => editor.chain().focus().undo().run()} label="تراجع">
        <Undo2 className="h-4 w-4" />
      </Btn>
      <Btn on={() => editor.chain().focus().redo().run()} label="إعادة">
        <Redo2 className="h-4 w-4" />
      </Btn>
    </div>
  );
}

/** WYSIWYG editor (TipTap) that emits HTML into `onChange`. */
export function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand-300 underline" } }),
      Image,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
        dir: "auto",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. loading an existing post).
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 text-sm text-slate-500">
        جارٍ تحميل المحرّر…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900/60">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
