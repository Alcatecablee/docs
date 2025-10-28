import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

interface EditableParagraphProps {
  text: string;
  isEditing: boolean;
  onUpdate: (text: string) => void;
}

export function EditableParagraph({ text, isEditing, onUpdate }: EditableParagraphProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: !isEditing,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
    ],
    content: text,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== text) {
      editor.commands.setContent(text);
    }
  }, [text, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  if (!editor) {
    return <p className="text-gray-700 leading-relaxed">{text}</p>;
  }

  return (
    <div className={`
      group relative
      ${isEditing ? 'hover:ring-2 hover:ring-blue-200 rounded-lg p-2 -m-2 transition-all' : ''}
    `}>
      <EditorContent 
        editor={editor}
        className="text-gray-700 leading-relaxed prose prose-sm max-w-none
          prose-p:my-0 prose-strong:font-bold prose-em:italic
          prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-a:text-blue-600 prose-a:underline"
      />
      {isEditing && (
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            Paragraph
          </div>
        </div>
      )}
    </div>
  );
}
