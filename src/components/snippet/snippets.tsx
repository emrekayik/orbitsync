"use client";

import { FC, useState } from "react";
import * as Evolu from "@evolu/common";
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
import { toast } from "sonner";
import { SettingsDialog } from "../settings-dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
};

export const Snippets: FC = () => {
  const snippets = useQuery(snippetsQuery);
  const { insert } = useEvolu();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [language, setLanguage] = useState("text");

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
          <Image src="/snipsync.svg" alt="Snipsync" width={24} height={24} />
          snipsync.
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

        {language === "text" ? (
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Paste text or code here..."
            className="w-full min-h-[140px] bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none rounded-none text-[13px] px-4 py-3 outline-none resize-y text-foreground placeholder:text-muted-foreground font-mono"
            spellCheck={false}
          />
        ) : (
          <div className="bg-muted/30 min-h-[140px]">
            <CodeMirror
              value={newContent}
              minHeight="140px"
              extensions={[EXTENSIONS[language] || []]}
              onChange={(value) => setNewContent(value)}
              className="*:outline-none p-1 text-[13px]"
              theme="light"
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/50">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px] h-8 text-[12px] font-medium bg-transparent border-0 shadow-none focus:ring-0 text-muted-foreground hover:text-foreground px-2">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text" className="text-[12px]">Plain Text</SelectItem>
              <SelectItem value="javascript" className="text-[12px]">JavaScript / TS</SelectItem>
              <SelectItem value="python" className="text-[12px]">Python</SelectItem>
              <SelectItem value="html" className="text-[12px]">HTML</SelectItem>
              <SelectItem value="css" className="text-[12px]">CSS</SelectItem>
              <SelectItem value="json" className="text-[12px]">JSON</SelectItem>
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

      <ol className="space-y-6">
        {snippets.length === 0 ? (
          <li className="text-sm text-muted-foreground py-12 text-center">
            No snippets found. Start building your pocket memory.
          </li>
        ) : (
          snippets.map((snippet) => (
            <SnippetItem key={snippet.id} row={snippet} />
          ))
        )}
      </ol>
    </div>
  );
};
