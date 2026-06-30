"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { key: "N", description: "Create a new ticket from anywhere" },
    { key: "/", description: "Focus the global search bar" },
    { key: "ESC", description: "Close any open dialog or modal" },
    { key: "K", description: "Open board switcher dropdown", modifier: "Ctrl" },
    { key: "?", description: "Toggle this shortcuts guide helper" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <span className="font-bold text-sm flex items-center gap-1.5 text-foreground select-none">
            <Keyboard className="w-4.5 h-4.5 text-indigo-400" />
            <span>Keyboard Shortcuts Guide</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-4">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground select-none">
              <span className="font-medium text-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.modifier && (
                  <>
                    <kbd className="px-2 py-1 bg-muted border border-border rounded shadow-sm text-[10px] font-mono font-bold text-foreground">
                      {shortcut.modifier}
                    </kbd>
                    <span className="text-[10px] font-mono font-semibold">+</span>
                  </>
                )}
                <kbd className="px-2 py-1 bg-muted border border-border rounded shadow-sm text-[10px] font-mono font-bold text-foreground min-w-[20px] text-center">
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
