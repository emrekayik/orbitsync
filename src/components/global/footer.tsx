import { FC } from "react";

export const Footer: FC = () => {
  return (
    <footer className="w-full py-2 border-t border-border/60 bg-card">
      <div className="container mx-auto px-4">
        <p className="text-end text-sm text-muted-foreground">
          orbitsync. <sub>Your snippets, everywhere.</sub>
        </p>
      </div>
    </footer>
  );
};
