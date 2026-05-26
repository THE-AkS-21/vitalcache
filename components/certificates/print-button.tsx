'use client';

/**
 * PrintButton — react-to-print wrapper
 *
 * This component is the ONLY entry point for react-to-print.
 * It is imported via next/dynamic({ ssr: false }) in the certificates page,
 * which means the react-to-print library is:
 * ✅ NOT included in the initial JS bundle
 * ✅ Downloaded as a separate chunk when the certificates page mounts
 * ✅ Never executed on the server (ssr: false)
 *
 * The printRef is passed from the parent (CertificatesPage) so this
 * component never needs to own any DOM state.
 */

import { type RefObject } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface PrintButtonProps {
  printRef: RefObject<HTMLDivElement | null>;
}

export default function PrintButton({ printRef }: PrintButtonProps) {
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Medical Certificate — VitalCache',
    onAfterPrint: () => console.info('[PrintButton] Print dialog closed'),
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      onClick={() => handlePrint()}
      aria-label="Print medical certificate"
    >
      <Icons.file className="h-4 w-4" aria-hidden="true" />
      Print Certificate
    </Button>
  );
}
