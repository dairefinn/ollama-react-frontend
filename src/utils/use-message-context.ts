import { useState, useEffect, useRef } from 'react';
import { readStorageFile, writeStorageFile } from './fs-storage';

const DEFAULT_MESSAGE_CONTEXT = 'Current time: {{timestamp}}';

export function useMessageContext(): [string, (context: string) => void] {
  const [messageContext, setMessageContextState] = useState<string>(DEFAULT_MESSAGE_CONTEXT);
  const loaded = useRef(false);

  useEffect(() => {
    readStorageFile('message-context.txt').then(content => {
      if (content !== null) setMessageContextState(content);
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    writeStorageFile('message-context.txt', messageContext);
  }, [messageContext]);

  return [messageContext, setMessageContextState];
}
