import { useEffect, useState } from 'react';
import { getProgress, subscribe, type IProgress } from '@/lib/store';

export default function useProgress(): IProgress {
  const [progress, setProgress] = useState<IProgress>(() => getProgress());

  useEffect(() => subscribe(() => setProgress(getProgress())), []);

  return progress;
}
