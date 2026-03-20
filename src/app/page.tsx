"use client";

import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/store/evolu";
import { Todos } from "@/components/Todos";
import { OwnerActions } from "@/components/OwnerActions";

export default function Home() {
  return (
    <div className="min-h-screen px-8 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-2 flex items-center justify-between pb-4">
          <h1 className="w-full text-center text-xl font-semibold text-gray-900">
            Minimal Todo App
          </h1>
        </div>

        <EvoluProvider value={evolu}>
          {/*
            Suspense delivers great UX (no loading flickers) and DX (no loading
            states to manage). Highly recommended with Evolu.
          */}
          <Suspense fallback={null}>
            <Todos />
            <OwnerActions />
          </Suspense>
        </EvoluProvider>
      </div>
    </div>
  );
}
