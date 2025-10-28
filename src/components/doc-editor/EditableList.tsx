import { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon, ListBulletIcon, BarsArrowDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface EditableListProps {
  items: string[];
  ordered: boolean;
  isEditing: boolean;
  onUpdate: (updates: { items?: string[]; ordered?: boolean }) => void;
}

export function EditableList({ items, ordered, isEditing, onUpdate }: EditableListProps) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
  };

  const handleItemBlur = () => {
    if (JSON.stringify(localItems) !== JSON.stringify(items)) {
      onUpdate({ items: localItems });
    }
  };

  const addItem = () => {
    const newItems = [...localItems, ''];
    setLocalItems(newItems);
    onUpdate({ items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onUpdate({ items: newItems });
  };

  const toggleListType = () => {
    onUpdate({ ordered: !ordered });
  };

  const ListTag = ordered ? 'ol' : 'ul';
  const listClass = ordered 
    ? 'list-decimal list-inside space-y-1 text-gray-700 ml-4' 
    : 'list-disc list-inside space-y-1 text-gray-700 ml-4';

  if (!isEditing) {
    return (
      <ListTag className={listClass}>
        {items.map((item, index) => (
          <li key={index} className="leading-relaxed">{item}</li>
        ))}
      </ListTag>
    );
  }

  return (
    <div className="group relative hover:ring-2 hover:ring-blue-200 rounded-lg p-3 -m-3 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleListType}
            className="h-7 text-xs"
          >
            {ordered ? (
              <><BarsArrowDownIcon className="h-3 w-3 mr-1" />Ordered</>
            ) : (
              <><ListBulletIcon className="h-3 w-3 mr-1" />Unordered</>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={addItem}
            className="h-7 text-xs"
          >
            <PlusIcon className="h-3 w-3 mr-1" />Add Item
          </Button>
        </div>
      </div>

      <ListTag className={listClass}>
        {localItems.map((item, index) => (
          <li key={index} className="leading-relaxed flex items-center gap-2 group/item">
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              onBlur={handleItemBlur}
              className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none py-1"
              placeholder="List item..."
            />
            <button
              onClick={() => removeItem(index)}
              className="opacity-0 group-hover/item:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ListTag>

      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          List
        </div>
      </div>
    </div>
  );
}
