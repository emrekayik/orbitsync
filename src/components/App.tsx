"use client";

import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "@/store/evolu";
import { Todos } from "@/components/Todos";
import { OwnerActions } from "@/components/OwnerActions";
import Navbar from "./global/navbar";

export default function App() {
  return (
    <div className="min-h-screen px-8 py-8">
      <Navbar />
      <div className="mx-auto max-w-md">
        <EvoluProvider value={evolu}>
          <Suspense fallback={null}>
            <Todos />
            <OwnerActions />
          </Suspense>
        </EvoluProvider>
      </div>
    </div>
  );
}
