import Image from 'next/image';

/** Shared review-flow mark; the adjacent wordmark provides the accessible name. */
export default function BrandMark({ size = 32, fill = false }: { size?: number; fill?: boolean }) {
  return <Image src="/brand-mark.svg" alt="" aria-hidden="true" width={size} height={size} style={{ display: 'block', flexShrink: 0, ...(fill ? { width: '100%', height: '100%' } : {}) }} />;
}
