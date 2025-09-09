// components/instagram-info.tsx
import { cn } from '@/lib/cn';
import { Instagram } from 'lucide-react';
import { type AnchorHTMLAttributes } from 'react';

export function InstagramInfo({
  username,
  displayName,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  username: string;
  displayName?: string; 
}) {
  return (
    <a
      href={`https://instagram.com/${username}`}
      rel="noreferrer noopener"
      target="_blank"
      {...props}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg text-sm text-fd-foreground/80 transition-colors hover:text-fd-accent-foreground hover:bg-fd-accent',
        props.className,
      )}
    >
      <Instagram className="size-3.5" />
      {displayName || username}
    </a>
  );
}