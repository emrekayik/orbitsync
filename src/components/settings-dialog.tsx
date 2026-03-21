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
import { IconSettings } from "@tabler/icons-react";

export const SettingsDialog: FC = () => {
  const evoluStore = useEvolu();
  const appOwner = use(evoluStore.appOwner);

  const [showMnemonic, setShowMnemonic] = useState(false);
  const [open, setOpen] = useState(false);

  // Restore owner from mnemonic to sync data across devices.
  const handleRestoreAppOwnerClick = () => {
    const mnemonic = window.prompt("Enter your mnemonic to restore your data:");
    if (mnemonic == null) return;

    const result = Evolu.Mnemonic.from(mnemonic.trim());
    if (!result.ok) {
      toast.error(
        "Invalid mnemonic. Please check your 12-word recovery phrase.",
      );
      return;
    }

    void evoluStore.restoreAppOwner(result.value);
    setOpen(false);
  };

  const handleResetAppOwnerClick = () => {
    if (window.confirm("Are you sure? This will delete all your local data.")) {
      void evoluStore.resetAppOwner();
      setOpen(false);
    }
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
        <Button
          variant="outline"
          className="w-full mt-4 mb-2 gap-2 text-gray-500"
        >
          <IconSettings className="size-4" />
          Settings & Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings & Synchronization</DialogTitle>
          <DialogDescription>
            Your snippets are end-to-end encrypted and stored locally. Securely
            sync across devices using your unique 12-word mnemonic phrase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-gray-900">
                Recovery Phrase
              </Label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="h-8 shadow-none"
              >
                {showMnemonic ? "Hide" : "Reveal"}
              </Button>
            </div>
            {showMnemonic && appOwner.mnemonic && (
              <Textarea
                value={appOwner.mnemonic}
                readOnly
                rows={3}
                className="w-full bg-white font-mono text-xs focus-visible:ring-1 focus-visible:border-gray-300"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleRestoreAppOwnerClick}
              className="justify-start shadow-none"
            >
              Restore from Mnemonic
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadDatabaseClick}
              className="justify-start shadow-none"
            >
              Download Local Backup
            </Button>
            <Button
              variant="outline"
              onClick={handleResetAppOwnerClick}
              className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 shadow-none border-red-200"
            >
              Reset All Local Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
