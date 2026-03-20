export default function Navbar() {
  return (
    <nav className="bg-background max-w-lg mx-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="shrink-0 flex flex-col">
              <span className="text-2xl font-bold font-noto">snipsync</span>
              <span className="text-sm text-muted-foreground">
                The developer's pocket memory.
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
