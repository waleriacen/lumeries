export default function PosterRenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #000; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
