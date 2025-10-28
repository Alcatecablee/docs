import { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditableHeadingProps {
  text: string;
  level: 2 | 3 | 4 | 5 | 6;
  isEditing: boolean;
  onUpdate: (updates: { text?: string; level?: number }) => void;
}

export function EditableHeading({ text, level, isEditing, onUpdate }: EditableHeadingProps) {
  const [localText, setLocalText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleBlur = () => {
    if (localText !== text) {
      onUpdate({ text: localText });
    }
  };

  const handleLevelChange = (newLevel: string) => {
    onUpdate({ level: parseInt(newLevel) });
  };

  const headingClasses = {
    2: 'text-2xl font-bold text-gray-900 mt-6 mb-3',
    3: 'text-xl font-bold text-gray-900 mt-5 mb-2',
    4: 'text-lg font-semibold text-gray-900 mt-4 mb-2',
    5: 'text-base font-semibold text-gray-900 mt-3 mb-1',
    6: 'text-sm font-semibold text-gray-900 mt-2 mb-1',
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  if (!isEditing) {
    return (
      <HeadingTag className={headingClasses[level]}>
        {text}
      </HeadingTag>
    );
  }

  return (
    <div className="group relative hover:ring-2 hover:ring-blue-200 rounded-lg p-2 -m-2 transition-all">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          className={`${headingClasses[level]} flex-1 bg-transparent border-none outline-none`}
          placeholder="Heading text..."
        />
        <Select value={level.toString()} onValueChange={handleLevelChange}>
          <SelectTrigger className="w-20 h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">H2</SelectItem>
            <SelectItem value="3">H3</SelectItem>
            <SelectItem value="4">H4</SelectItem>
            <SelectItem value="5">H5</SelectItem>
            <SelectItem value="6">H6</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          Heading
        </div>
      </div>
    </div>
  );
}
