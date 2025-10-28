import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CalloutType } from '../../../shared/doc-editor-types';

interface EditableCalloutProps {
  text: string;
  calloutType: CalloutType;
  isEditing: boolean;
  onUpdate: (updates: { text?: string; calloutType?: CalloutType }) => void;
}

const calloutStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  tip: 'bg-purple-50 border-purple-200 text-purple-900',
};

const calloutIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  tip: '💡',
};

export function EditableCallout({ text, calloutType, isEditing, onUpdate }: EditableCalloutProps) {
  const [localText, setLocalText] = useState(text);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleBlur = () => {
    if (localText !== text) {
      onUpdate({ text: localText });
    }
  };

  const handleTypeChange = (newType: string) => {
    onUpdate({ calloutType: newType as CalloutType });
  };

  if (!isEditing) {
    return (
      <div className={`callout p-4 rounded-lg border-l-4 ${calloutStyles[calloutType]}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{calloutIcons[calloutType]}</span>
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative callout p-4 rounded-lg border-l-4 ${calloutStyles[calloutType]} hover:ring-2 hover:ring-blue-200 transition-all`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{calloutIcons[calloutType]}</span>
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          className="flex-1 bg-transparent text-sm leading-relaxed outline-none resize-none min-h-[60px]"
          placeholder="Callout text..."
        />
        <Select value={calloutType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-28 h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="tip">Tip</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          Callout
        </div>
      </div>
    </div>
  );
}
