"use client";

import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/store/evolu";
import { Snippets } from "./snippet/snippets";

export default function App() {
  return (
    <div className="min-h-screen bg-[#fafafa] sm:px-6 px-4 py-12 font-sans selection:bg-gray-200">
      <div className="mx-auto max-w-2xl">
        <EvoluProvider value={evolu}>
          <Suspense fallback={null}>
            <Snippets />
          </Suspense>
        </EvoluProvider>
      </div>
    </div>
  );
}
