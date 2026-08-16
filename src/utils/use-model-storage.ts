import { useState, useEffect, useRef } from 'react';
import { readStorageFile, writeStorageFile } from './fs-storage';

export function useModelStorage(): [string, (model: string) => void] {
  const [model, setModelState] = useState<string>('');
  const loaded = useRef(false);

  useEffect(() => {
    readStorageFile('model.txt').then(content => {
      if (content !== null) setModelState(content);
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    writeStorageFile('model.txt', model);
  }, [model]);

  return [model, setModelState];
}
