// app/docs/layout.tsx

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { InstagramInfo } from '@/components/instagram-info';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions()}>
      {children}

      <div className="mt-auto p-4 border-t border-fd-border flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
        <InstagramInfo username="ditorifkii" displayName="Dito" className="text-xs md:text-sm" />
        <InstagramInfo username="andryanolimbong" displayName="Andryano" className="text-xs md:text-sm" />
        <InstagramInfo username="nadshafy" displayName="Nadya" className="text-xs md:text-sm" />
      </div>
    </DocsLayout>
  );
}