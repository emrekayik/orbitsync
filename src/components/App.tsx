"use client";

import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/store/evolu";
import { SettingsDialog } from "@/components/settings-dialog";
import Navbar from "./global/navbar";
import { Snippets } from "./snippet/snippets";

export default function App() {
  return (
    <div className="min-h-screen px-8 py-8">
      <Navbar />
      <div className="mx-auto max-w-md">
        <EvoluProvider value={evolu}>
          <Suspense fallback={null}>
            <Snippets />
            <SettingsDialog />
          </Suspense>
        </EvoluProvider>
      </div>
    </div>
  );
}
