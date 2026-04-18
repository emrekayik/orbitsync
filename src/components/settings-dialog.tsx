"use client";

import { FC, use, useState } from "react";
import * as Evolu from "@evolu/common";
import { useEvolu } from "@/store/evolu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconSettings, IconCopy, IconCheck, IconQrcode } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { ThemeSelector } from "./theme-selector";

export const SettingsDialog: FC = () => {
  const evoluStore = useEvolu();
  const appOwner = use(evoluStore.appOwner);

  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const [restoreMnemonic, setRestoreMnemonic] = useState("");
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Restore owner from mnemonic to sync data across devices.
  const handleRestoreSubmit = () => {
    if (!restoreMnemonic) return;

    const result = Evolu.Mnemonic.from(restoreMnemonic.trim());
    if (!result.ok) {
      toast.error(
        "Invalid mnemonic. Please check your 12-word recovery phrase.",
      );
      return;
    }

    void evoluStore.restoreAppOwner(result.value);
    setIsRestoreOpen(false);
    setOpen(false);
    toast.success("Data restored successfully!");
  };

  const handleResetAppOwnerClick = () => {
    void evoluStore.resetAppOwner();
    setIsResetOpen(false);
    setOpen(false);
    toast.success("Local data reset");
  };

  const handleCopyClick = () => {
    if (!appOwner.mnemonic) return;
    navigator.clipboard.writeText(appOwner.mnemonic);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleDownloadDatabaseClick = () => {
    void evoluStore.exportDatabase().then((array) => {
      const blob = new Blob([array], {
        type: "application/x-sqlite3",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "snipsync.sqlite3";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <IconSettings
            stroke={1.5}
            className="w-[18px] h-[18px] text-primary"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground font-medium">
            Settings & Sync
          </DialogTitle>
          <DialogDescription className="text-sm">
            Your snippets are end-to-end encrypted and stored locally. Securely
            sync across devices using your unique 12-word mnemonic phrase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 mt-2">
          <div className="space-y-4 rounded-xl bg-muted/50 p-4 border border-border">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-foreground text-sm">
                Recovery Phrase
              </Label>
              <div className="flex gap-2">
                {showMnemonic && appOwner.mnemonic && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-[40px] px-0 transition-all"
                      onClick={() => setShowQR(!showQR)}
                      title="Show QR Code"
                    >
                      <IconQrcode stroke={2} size={16} className={showQR ? "text-primary" : ""} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-[84px] transition-all"
                      onClick={handleCopyClick}
                    >
                    {isCopied ? (
                      <span className="flex items-center gap-1.5 text-primary font-medium">
                        <IconCheck stroke={2} size={14} />
                        Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <IconCopy stroke={2} size={14} />
                        Copy
                      </span>
                    )}
                  </Button>
                </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-[72px]"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                >
                  {showMnemonic ? "Hide" : "Reveal"}
                </Button>
              </div>
            </div>
            {showMnemonic && appOwner.mnemonic && (
              <div className="flex flex-col gap-3">
                <Textarea
                  value={appOwner.mnemonic}
                  readOnly
                  rows={3}
                  spellCheck={false}
                  className="w-full bg-background font-mono text-xs focus-visible:ring-1 focus-visible:border-ring resize-none shadow-sm"
                />
                
                {showQR && (
                  <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center border border-border shadow-sm mx-auto w-full">
                    <span className="text-xs text-muted-foreground font-medium mb-3 text-center">
                      Scan to quickly sync your mobile device
                    </span>
                    <QRCodeSVG 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}?sync=${encodeURIComponent(appOwner.mnemonic)}`} 
                      size={180} 
                      className="mb-2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="py-2 border-t border-b border-border/50 my-2">
              <Label className="font-semibold text-foreground text-sm mb-3 block">
                Theme & Appearance
              </Label>
              <ThemeSelector />
            </div>

            <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start shadow-none font-medium h-9 text-sm"
                >
                  Restore from Mnemonic
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Restore Data</DialogTitle>
                  <DialogDescription>
                    Enter your 12-word mnemonic phrase to restore your data from
                    another device.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Textarea
                    value={restoreMnemonic}
                    onChange={(e) => setRestoreMnemonic(e.target.value)}
                    placeholder="Enter your mnemonic phrase"
                    rows={3}
                  />
                  <Button onClick={handleRestoreSubmit}>Restore</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={handleDownloadDatabaseClick}
              className="justify-start shadow-none font-medium h-9 text-sm"
            >
              Download Local Backup
            </Button>

            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start font-medium text-red-600 hover:text-red-700 hover:bg-red-50 shadow-none border-red-200 h-9 text-sm"
                >
                  Reset All Local Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Reset All Local Data</DialogTitle>
                  <DialogDescription>
                    Are you absolutely sure? This will delete all your local
                    data immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsResetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleResetAppOwnerClick}
                  >
                    Yes, Reset Data
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="py-3 mt-2 border-t border-border/50">
            <Label className="font-semibold text-foreground text-sm mb-3 block">
              About orbitsync
            </Label>
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p><strong>orbitsync</strong> is a secure, local-first snippet manager.</p>
              <ul className="list-disc pl-4 space-y-1 marker:text-primary">
                <li>End-to-end encrypted peer-to-peer sync.</li>
                <li>Local-first architecture with full offline support.</li>
                <li>Advanced snippet editor with syntax highlighting.</li>
                <li>Instant dynamic search and autocomplete tags.</li>
                <li>Rich link previews and automatic extraction.</li>
              </ul>
              <div className="pt-2 mt-1 flex items-center justify-between border-t border-border/40 opacity-80 dark:opacity-70">
                <span>v0.1.12</span>
                <span>
                  Developed by{" "}
                  <a
                    href="https://github.com/emrekayik"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary underline-offset-2"
                  >
                    Emre Kayık
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
