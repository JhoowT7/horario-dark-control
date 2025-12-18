
import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsOptions {
  onSave?: () => void;
  onEscape?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onSave,
  onEscape,
  onPrevMonth,
  onNextMonth,
  onToday,
  onEnter,
  enabled = true
}: KeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    
    // Ctrl/Cmd + S - Save
    if (isCtrlOrCmd && e.key === 's') {
      e.preventDefault();
      onSave?.();
      return;
    }
    
    // Ctrl/Cmd + H - Go to today
    if (isCtrlOrCmd && e.key === 'h') {
      e.preventDefault();
      onToday?.();
      return;
    }
    
    // Escape - Go back
    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
      return;
    }
    
    // Arrow keys for month navigation (only when not in input)
    const activeElement = document.activeElement;
    const isInInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
    
    if (!isInInput) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevMonth?.();
        return;
      }
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNextMonth?.();
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter?.();
        return;
      }
    }
  }, [enabled, onSave, onEscape, onPrevMonth, onNextMonth, onToday, onEnter]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
