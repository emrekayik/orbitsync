"use client";

import { FC, use, useState } from "react";
import * as Evolu from "@evolu/common";
import { useEvolu } from "@/store/evolu";
import { Button } from "./ui/Button";

export const OwnerActions: FC = () => {
  const evoluStore = useEvolu();
  const appOwner = use(evoluStore.appOwner);

  const [showMnemonic, setShowMnemonic] = useState(false);

  // Restore owner from mnemonic to sync data across devices.
  const handleRestoreAppOwnerClick = () => {
    const mnemonic = window.prompt("Enter your mnemonic to restore your data:");
    if (mnemonic == null) return;

    const result = Evolu.Mnemonic.from(mnemonic.trim());
    if (!result.ok) {
      alert("Geçersiz yedekleme kelimeleri. Lütfen 12 kelimelik anahtarınızı kontrol edin.");
      return;
    }

    void evoluStore.restoreAppOwner(result.value);
  };

  const handleResetAppOwnerClick = () => {
    if (window.confirm("Are you sure? This will delete all your local data.")) {
      void evoluStore.resetAppOwner();
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
      a.download = "todos.sqlite3";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="mt-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-lg font-medium text-gray-900">Account</h2>
      <p className="mb-4 text-sm text-gray-600">
        Todos are stored in local SQLite. When you sync across devices, your
        data is end-to-end encrypted using your mnemonic.
      </p>

      <div className="space-y-3">
        <Button
          title={`${showMnemonic ? "Hide" : "Show"} Mnemonic`}
          onClick={() => {
            setShowMnemonic(!showMnemonic);
          }}
          className="w-full"
        />

        {showMnemonic && appOwner.mnemonic && (
          <div className="bg-gray-50 p-3">
            <label className="mb-2 block text-xs font-medium text-gray-700">
              Your Mnemonic (keep this safe!)
            </label>
            <textarea
              value={appOwner.mnemonic}
              readOnly
              rows={3}
              className="w-full border-b border-gray-300 bg-white px-2 py-1 font-mono text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            title="Restore from Mnemonic"
            onClick={handleRestoreAppOwnerClick}
          />
          <Button title="Reset All Data" onClick={handleResetAppOwnerClick} />
          <Button
            title="Download Backup"
            onClick={handleDownloadDatabaseClick}
          />
        </div>
      </div>
    </div>
  );
};
