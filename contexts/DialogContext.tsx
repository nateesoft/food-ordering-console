'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type DialogVariant = 'info' | 'warning' | 'confirm';

export interface DialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogState {
  open: boolean;
  variant: DialogVariant;
  options: DialogOptions;
  resolve: (value: boolean) => void;
}

interface DialogContextValue {
  state: DialogState | null;
  confirm: (options: DialogOptions) => Promise<boolean>;
  info: (options: DialogOptions) => Promise<void>;
  warning: (options: DialogOptions) => Promise<void>;
  close: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const open = useCallback((variant: DialogVariant, options: DialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        variant,
        options,
        resolve,
      });
    });
  }, []);

  const confirm = useCallback((options: DialogOptions) => open('confirm', options), [open]);

  const info = useCallback(
    async (options: DialogOptions) => { await open('info', options); },
    [open],
  );

  const warning = useCallback(
    async (options: DialogOptions) => { await open('warning', options); },
    [open],
  );

  const close = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setState(null);
  }, []);

  return (
    <DialogContext.Provider value={{ state, confirm, info, warning, close }}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within DialogProvider');
  return ctx;
}
