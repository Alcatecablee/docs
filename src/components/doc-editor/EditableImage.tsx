import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PhotoIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface EditableImageProps {
  url: string;
  alt?: string;
  caption?: string;
  isEditing: boolean;
  onUpdate: (updates: { url?: string; alt?: string; caption?: string }) => void;
  onDelete?: () => void;
}

export function EditableImage({ url, alt, caption, isEditing, onUpdate, onDelete }: EditableImageProps) {
  const [localUrl, setLocalUrl] = useState(url);
  const [localAlt, setLocalAlt] = useState(alt || '');
  const [localCaption, setLocalCaption] = useState(caption || '');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalUrl(url);
    setLocalAlt(alt || '');
    setLocalCaption(caption || '');
  }, [url, alt, caption]);

  const handleUrlChange = (newUrl: string) => {
    setLocalUrl(newUrl);
    setImageError(false);
  };

  const handleUrlBlur = () => {
    if (localUrl !== url) {
      onUpdate({ url: localUrl });
    }
  };

  const handleAltBlur = () => {
    if (localAlt !== alt) {
      onUpdate({ alt: localAlt });
    }
  };

  const handleCaptionBlur = () => {
    if (localCaption !== caption) {
      onUpdate({ caption: localCaption });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLocalUrl(dataUrl);
      onUpdate({ url: dataUrl });
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  if (!isEditing) {
    return (
      <figure className="my-6">
        {!imageError ? (
          <img
            src={url}
            alt={alt || ''}
            className="rounded-lg border border-gray-200 w-full"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-100 h-48 flex items-center justify-center">
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {caption && (
          <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <div className="group relative my-6 hover:ring-2 hover:ring-blue-200 rounded-lg p-4 -m-4 transition-all">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="space-y-3">
        {/* Image Preview */}
        <div className="relative">
          {!imageError && localUrl ? (
            <img
              src={localUrl}
              alt={localAlt || ''}
              className="rounded-lg border border-gray-200 w-full"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-100 h-48 flex items-center justify-center">
              <PhotoIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Image Controls */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs"
            >
              <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
              Upload
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                className="h-8 text-xs"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={localUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Alt Text Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
          <input
            type="text"
            value={localAlt}
            onChange={(e) => setLocalAlt(e.target.value)}
            onBlur={handleAltBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Description for accessibility"
          />
        </div>

        {/* Caption Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Caption</label>
          <input
            type="text"
            value={localCaption}
            onChange={(e) => setLocalCaption(e.target.value)}
            onBlur={handleCaptionBlur}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Optional caption"
          />
        </div>
      </div>

      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          Image
        </div>
      </div>
    </div>
  );
}
