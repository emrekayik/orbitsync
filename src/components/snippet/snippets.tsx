"use client";

import { FC, useState } from "react";
import * as Evolu from "@evolu/common";
import { useQuery } from "@evolu/react";
import { useEvolu, snippetsQuery } from "@/store/evolu";
import { snippetSchema } from "@/schema/snippet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SnippetItem } from "./snippet-item";
import { Textarea } from "../ui/textarea";

export const Snippets: FC = () => {
  // useQuery returns live data - component re-renders when data changes.
  const snippets = useQuery(snippetsQuery);
  const { insert } = useEvolu();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  const addSnippet = () => {
    const parseResult = snippetSchema.safeParse({
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags.trim() || undefined,
    });

    if (!parseResult.success) {
      alert(parseResult.error.issues[0].message);
      return;
    }

    const result = insert(
      "snippet",
      {
        title: parseResult.data.title as never,
        content: parseResult.data.content as never,
        tags: (parseResult.data.tags ? parseResult.data.tags : null) as never,
      },
      {
        onComplete: () => {
          setNewTitle("");
          setNewContent("");
          setNewTags("");
        },
      },
    );

    if (!result.ok) {
      alert("Bilinmeyen bir hata oluştu.");
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Snippets</h2>
        <p className="text-sm text-gray-500">
          Your synced snippets across devices.
        </p>
      </div>

      <ol className="mb-6 space-y-2">
        {snippets.length === 0 ? (
          <li className="text-sm text-gray-500 py-4 text-center">
            No snippets found. Add your first snippet below.
          </li>
        ) : (
          snippets.map((snippet) => (
            <SnippetItem key={snippet.id} row={snippet} />
          ))
        )}
      </ol>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Snippet title (e.g. Database URL)"
            className="flex-1"
          />
          <Input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-48"
          />
        </div>
        <div className="flex gap-2">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addSnippet();
            }}
            placeholder="Snippet content..."
            className="flex-1"
          />
          <Button onClick={addSnippet}>Add</Button>
        </div>
      </div>
    </div>
  );
};
