import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps { fullScreen?: boolean; size?: 'sm' | 'md' | 'lg'; }

export function Loader({ fullScreen = false, size = 'md' }: LoaderProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <div className={cn('flex items-center justify-center', fullScreen && 'min-h-screen')}><Loader2 className={cn('animate-spin text-primary', sizes[size])} /></div>;
}
