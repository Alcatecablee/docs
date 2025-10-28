import { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface EditableCodeBlockProps {
  code: string;
  language: string;
  isEditing: boolean;
  onUpdate: (updates: { code?: string; language?: string }) => void;
}

const languageExtensions = {
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  python: python(),
  html: html(),
  css: css(),
  json: javascript(),
  bash: javascript(),
  shell: javascript(),
};

export function EditableCodeBlock({ code, language, isEditing, onUpdate }: EditableCodeBlockProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [localLanguage, setLocalLanguage] = useState(language || 'javascript');

  useEffect(() => {
    if (!editorRef.current || !isEditing) return;

    const languageExt = languageExtensions[localLanguage as keyof typeof languageExtensions] || javascript();

    const startState = EditorState.create({
      doc: code || '',
      extensions: [
        highlightSpecialChars(),
        history(),
        drawSelection(),
        syntaxHighlighting(defaultHighlightStyle),
        bracketMatching(),
        highlightActiveLine(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        languageExt,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            onUpdate({ code: newCode });
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [isEditing, localLanguage]);

  const handleLanguageChange = (newLanguage: string) => {
    setLocalLanguage(newLanguage);
    onUpdate({ language: newLanguage });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code || '');
    toast.success('Code copied to clipboard!');
  };

  if (!isEditing) {
    return (
      <div className="code-block-wrapper relative group">
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {language || 'code'}
          </span>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded transition-colors"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>
        </div>
        <pre className="bg-gray-900 rounded-lg overflow-x-auto p-4">
          <code className={`language-${language || 'javascript'} text-sm text-gray-100`}>
            {code}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="group relative hover:ring-2 hover:ring-blue-200 rounded-lg transition-all">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <Select value={localLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32 h-8 text-xs bg-gray-800 text-white border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="bash">Bash</SelectItem>
            <SelectItem value="shell">Shell</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded transition-colors h-8"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
        </button>
      </div>
      <div ref={editorRef} className="rounded-lg overflow-hidden min-h-[100px]" />
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          Code Block
        </div>
      </div>
    </div>
  );
}
