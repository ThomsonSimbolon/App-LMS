'use client';

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  return (
    <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
      <iframe
        src={url}
        className="w-full h-full"
        title="PDF Viewer"
      />
    </div>
  );
}
