/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

interface PreviewData {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string;
  domain: string;
  favicon: string | null;
}

export function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPreview = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (isMounted) setData(json);
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPreview();
    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl h-[120px] rounded-xl border border-border bg-card shadow-sm animate-pulse flex overflow-hidden">
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="h-4 bg-muted/70 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-muted/70 rounded w-full mb-1.5"></div>
            <div className="h-3 bg-muted/70 rounded w-5/6"></div>
          </div>
          <div className="h-3 bg-muted/70 rounded w-16 mt-3"></div>
        </div>
        <div className="w-1/3 bg-muted/50 border-l border-border h-full shrink-0"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full max-w-2xl p-4 rounded-xl border border-border bg-card shadow-sm hover:bg-accent/50 transition-colors"
      >
        <div className="text-[13px] font-medium text-primary hover:underline break-all">
          {url}
        </div>
      </a>
    );
  }

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col sm:flex-row w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:bg-accent/50 transition-colors h-auto sm:h-[120px] group"
    >
      <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden relative z-10">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {data.title || data.url}
          </h3>
          {data.description && (
            <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
          {data.favicon && (
            <img
              src={data.favicon}
              alt=""
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="truncate">{data.domain}</span>
        </div>
      </div>

      {data.image && (
        <div className="w-full sm:w-[160px] md:w-[200px] h-[140px] sm:h-full border-t sm:border-t-0 sm:border-l border-border bg-muted/30 relative overflow-hidden shrink-0">
          <img
            src={data.image}
            alt={data.title || "Link preview image"}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </a>
  );
}
