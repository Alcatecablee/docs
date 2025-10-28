/**
 * Auto-save Hook
 * Automatically saves documentation drafts every 30 seconds when changes are detected
 */

import { useEffect, useRef, useState } from 'react';
import type { Documentation } from '../../shared/doc-editor-types';

interface UseAutoSaveOptions {
  documentation: Documentation | null;
  isDirty: boolean;
  documentationId: number;
  onSave: (doc: Documentation) => Promise<void>;
  interval?: number; // milliseconds, default 30000 (30 seconds)
}

interface UseAutoSaveResult {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave({
  documentation,
  isDirty,
  documentationId,
  onSave,
  interval = 30000, // 30 seconds
}: UseAutoSaveOptions): UseAutoSaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDocRef = useRef<Documentation | null>(null);

  const saveNow = async () => {
    if (!documentation || !isDirty) return;
    
    // Prevent duplicate saves
    if (JSON.stringify(documentation) === JSON.stringify(lastSavedDocRef.current)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(documentation);
      setLastSaved(new Date());
      lastSavedDocRef.current = documentation;
    } catch (err: any) {
      console.error('Auto-save error:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || !documentation) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveNow();
    }, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [documentation, isDirty, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    error,
    saveNow,
  };
}
