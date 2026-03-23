"use client";

import { FC, useState } from "react";
import { useQuery } from "@evolu/react";
import { useEvolu, snippetsQuery } from "@/store/evolu";
import { snippetSchema } from "@/schema/snippet";
import { SnippetItem } from "./snippet-item";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { go } from "@codemirror/lang-go";
import { rust } from "@codemirror/lang-rust";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { toast } from "sonner";
import { SettingsDialog } from "../settings-dialog";
import { IconSearch } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXTENSIONS: Record<string, any> = {
  javascript: javascript({ jsx: true, typescript: true }),
  python: python(),
  html: html(),
  css: css(),
  json: json(),
  go: go(),
  rust: rust(),
  markdown: markdown(),
  sql: sql(),
  java: java(),
  cpp: cpp(),
};

export const Snippets: FC = () => {
  const snippets = useQuery(snippetsQuery);
  const { insert } = useEvolu();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [language, setLanguage] = useState("text");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSnippets = snippets.filter((snippet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      snippet.title?.toLowerCase().includes(query) ||
      snippet.content?.toLowerCase().includes(query) ||
      snippet.tags?.toLowerCase().includes(query) ||
      snippet.language?.toLowerCase().includes(query)
    );
  });

  const addSnippet = () => {
    const parseResult = snippetSchema.safeParse({
      title: newTitle.trim(),
      content: newContent,
      tags: newTags.trim() || undefined,
      language: language.trim() || undefined,
    });

    if (!parseResult.success) {
      toast.error(parseResult.error.issues[0].message);
      return;
    }

    const result = insert(
      "snippet",
      {
        title: parseResult.data.title as never,
        content: parseResult.data.content as never,
        tags: (parseResult.data.tags ? parseResult.data.tags : null) as never,
        language: (parseResult.data.language
          ? parseResult.data.language
          : null) as never,
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
      toast.error("Bilinmeyen bir hata oluştu.");
    }
  };

  return (
    <div className="w-full pb-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-primary font-noto flex items-center gap-2 select-none">
          <Image src="/orbitbase.svg" alt="Orbitbase" width={24} height={24} />
          orbitbase.
          <sub>
            <span className="text-xs text-muted-foreground">
              Your snippets, everywhere.
            </span>
          </sub>
        </h1>
        <SettingsDialog />
      </div>

      <div className="mb-14 rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-ring/20 transition-all">
        <div className="flex px-4 py-3 border-b border-border/60 bg-card gap-2">
          <Input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Snippet title..."
            className="flex-1 bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none text-[14px] font-medium text-foreground outline-none placeholder:text-muted-foreground placeholder:font-normal px-0"
          />
          <Input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (csv)"
            className="w-28 sm:w-36 bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none text-[12px] text-muted-foreground outline-none placeholder:text-muted-foreground/50 text-right px-0"
          />
        </div>

        <div className="bg-background min-h-[140px] border-y border-border/30">
          <CodeMirror
            value={newContent}
            minHeight="140px"
            placeholder="Paste text or code here..."
            extensions={language === "text" ? [] : [EXTENSIONS[language] || []]}
            onChange={(value) => setNewContent(value)}
            className="*:outline-none p-2 text-[13px] font-mono"
            theme="light"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
            }}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/50">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px] h-8 text-[12px] font-medium bg-transparent border-0 shadow-none focus:ring-0 text-muted-foreground hover:text-foreground px-2">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text" className="text-[12px]">
                Plain Text
              </SelectItem>
              <SelectItem value="javascript" className="text-[12px]">
                JavaScript / TS
              </SelectItem>
              <SelectItem value="python" className="text-[12px]">
                Python
              </SelectItem>
              <SelectItem value="html" className="text-[12px]">
                HTML
              </SelectItem>
              <SelectItem value="css" className="text-[12px]">
                CSS
              </SelectItem>
              <SelectItem value="json" className="text-[12px]">
                JSON
              </SelectItem>
              <SelectItem value="go" className="text-[12px]">
                Go
              </SelectItem>
              <SelectItem value="rust" className="text-[12px]">
                Rust
              </SelectItem>
              <SelectItem value="markdown" className="text-[12px]">
                Markdown
              </SelectItem>
              <SelectItem value="sql" className="text-[12px]">
                SQL
              </SelectItem>
              <SelectItem value="java" className="text-[12px]">
                Java
              </SelectItem>
              <SelectItem value="cpp" className="text-[12px]">
                C++
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={addSnippet}
            disabled={!newTitle || !newContent}
            size="sm"
          >
            Save snippet
          </Button>
        </div>
      </div>

      <div className="mb-6 relative">
        <IconSearch className="absolute left-3 top-[10px] h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search snippets by title, tags, or content (fast search)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border/70 focus-visible:ring-primary/20 shadow-sm"
        />
      </div>

      <ol className="space-y-6">
        {filteredSnippets.length === 0 ? (
          <li className="text-sm text-muted-foreground py-12 text-center">
            {snippets.length === 0
              ? "No snippets found. Start building your pocket memory."
              : "No snippets match your search."}
          </li>
        ) : (
          filteredSnippets.map((snippet) => (
            <SnippetItem key={snippet.id} row={snippet} />
          ))
        )}
      </ol>
    </div>
  );
};
