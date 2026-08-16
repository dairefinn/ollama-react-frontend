import { useState, useEffect, useRef } from 'react';
import { readStorageFile, writeStorageFile } from './fs-storage';

export function useSystemContext(): [string, (context: string) => void] {
  const [systemContext, setSystemContextState] = useState<string>('');
  const loaded = useRef(false);

  useEffect(() => {
    readStorageFile('system-context.txt').then(content => {
      if (content !== null) setSystemContextState(content);
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    writeStorageFile('system-context.txt', systemContext);
  }, [systemContext]);

  return [systemContext, setSystemContextState];
}
