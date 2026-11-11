'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <textarea
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-navy-950 border border-white/15 rounded-xl p-3 text-sm text-white"
      />
    );
  }

  return (
    <div className="border border-white/15 rounded-xl overflow-hidden bg-navy-950 text-white">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-navy-900">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('bold') ? 'bg-gold text-navy-950' : 'text-white/80'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('italic') ? 'bg-gold text-navy-950' : 'text-white/80'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-gold text-navy-950'
              : 'text-white/80'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-gold text-navy-950'
              : 'text-white/80'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('bulletList') ? 'bg-gold text-navy-950' : 'text-white/80'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('orderedList') ? 'bg-gold text-navy-950' : 'text-white/80'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-white/10 ${
            editor.isActive('blockquote') ? 'bg-gold text-navy-950' : 'text-white/80'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded hover:bg-white/10 text-white/70"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded hover:bg-white/10 text-white/70"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>
      <EditorContent editor={editor} className="text-sm text-white/90" />
    </div>
  );
}
