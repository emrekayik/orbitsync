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
import { AIAssistant } from "../ai-assistant";
import { IconSearch, IconLink, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/logo";
import { LinkPreview } from "@/components/ui/link-preview";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Evolu from "@evolu/common";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const evoluStore = useEvolu();
  const { insert } = evoluStore;
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [language, setLanguage] = useState("text");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(true);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagSelectedIndex, setTagSelectedIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const syncMnemonic = url.searchParams.get("sync");
      if (syncMnemonic) {
        const result = Evolu.Mnemonic.from(syncMnemonic);
        if (result.ok) {
          // Wrap in a void to suppress promise warnings
          void evoluStore.restoreAppOwner(result.value).then(() => {
            toast.success("Device successfully synced via QR!");
            url.searchParams.delete("sync");
            window.history.replaceState({}, document.title, url.toString());
          });
        } else {
          toast.error("Invalid QR code for sync.");
        }
      }
    }
  }, [evoluStore]);

  const allTags = Array.from(
    new Set(
      snippets
        .flatMap((s) => s.tags?.split(",").map((t) => t.trim()) || [])
        .filter(Boolean),
    ),
  ).sort();

  const currentTagWord = newTags.split(',').pop()?.trimLeft() || "";
  const existingTagsInInput = newTags.split(',').map(t => t.trim()).filter(Boolean);
  const matchingTags = allTags.filter(
    (t) =>
      t.toLowerCase().includes(currentTagWord.toLowerCase()) &&
      currentTagWord.length > 0 &&
      !existingTagsInInput.includes(t) &&
      t.toLowerCase() !== currentTagWord.trim().toLowerCase()
  );

  const safeSelectedIndex = Math.max(0, Math.min(tagSelectedIndex, matchingTags.length - 1));

  const addAutocompleteTag = (tag: string) => {
    if (!tag) return;
    const parts = newTags.split(',');
    parts.pop();
    const newString = [...parts.map(p => p.trim()), tag].filter(Boolean).join(', ') + ', ';
    setNewTags(newString);
    setTagMenuOpen(false);
    setTagSelectedIndex(0);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!tagMenuOpen || matchingTags.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      const nextIndex = (tagSelectedIndex + 1) % matchingTags.length;
      setTagSelectedIndex(nextIndex);
      document.getElementById(`tag-suggestion-${nextIndex}`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      const nextIndex = (tagSelectedIndex - 1 + matchingTags.length) % matchingTags.length;
      setTagSelectedIndex(nextIndex);
      document.getElementById(`tag-suggestion-${nextIndex}`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      addAutocompleteTag(matchingTags[safeSelectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setTagMenuOpen(false);
    }
  };

  const urls = Array.from(new Set(newContent.match(/(https?:\/\/[^\s]+)/g) || []));

  const filteredSnippets = snippets.filter((snippet) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      snippet.title?.toLowerCase().includes(query) ||
      snippet.content?.toLowerCase().includes(query) ||
      snippet.tags?.toLowerCase().includes(query) ||
      snippet.language?.toLowerCase().includes(query);

    const snippetTags =
      snippet.tags
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [];
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => snippetTags.includes(tag));

    return searchMatch && tagMatch;
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
          <Logo className="w-6 h-6 text-primary" />
          orbitsync.
          <sub>
            <span className="text-xs text-muted-foreground">
              Your snippets, everywhere.
            </span>
          </sub>
        </h1>
        <div className="flex items-center gap-2">
          <AIAssistant />
          <SettingsDialog />
        </div>
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
          <div className="relative w-28 sm:w-48 flex items-center justify-end">
            <Input
              type="text"
              value={newTags}
              onChange={(e) => {
                setNewTags(e.target.value);
                setTagMenuOpen(true);
                setTagSelectedIndex(0);
              }}
              onFocus={() => {
                setTagMenuOpen(true);
                setTagSelectedIndex(0);
              }}
              onBlur={() => setTimeout(() => setTagMenuOpen(false), 150)}
              onKeyDown={handleTagKeyDown}
              placeholder="Tags (csv)"
              className="w-full bg-transparent border-0 ring-0 focus-visible:ring-0 shadow-none text-[12px] text-muted-foreground outline-none placeholder:text-muted-foreground/50 text-right px-0"
            />
            <AnimatePresence>
              {tagMenuOpen && matchingTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-10 right-0 w-48 bg-card border border-border/80 shadow-md rounded-lg p-1.5 z-50 max-h-48 overflow-auto flex flex-col gap-0.5"
                >
                  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-1 select-none">
                    Suggestions
                  </span>
                  {matchingTags.map((tag, idx) => (
                    <button
                      key={tag}
                      id={`tag-suggestion-${idx}`}
                      type="button"
                      className={`w-full text-left px-2 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                        idx === safeSelectedIndex
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => addAutocompleteTag(tag)}
                      onMouseEnter={() => setTagSelectedIndex(idx)}
                    >
                      #{tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

        {urls.length > 0 && (
          <div className="border-t border-border/30 bg-card/40">
            <button 
              onClick={() => setShowLinks(!showLinks)}
              className="w-full flex items-center justify-between px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              type="button"
            >
              <div className="flex items-center gap-1.5">
                <IconLink stroke={1.5} className="w-4 h-4" />
                <span>Found {urls.length} link{urls.length > 1 ? 's' : ''} in snippet</span>
              </div>
              {showLinks ? <IconChevronDown stroke={1.5} className="w-4 h-4" /> : <IconChevronRight stroke={1.5} className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {showLinks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 space-y-3 bg-card/40 border-t border-border/20">
                    {urls.map((url, idx) => (
                      <div key={idx} className="w-full max-w-2xl">
                        <LinkPreview url={url} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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

      <AnimatePresence>
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-6 overflow-hidden"
          >
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      isSelected
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag],
                    )
                  }
                  className={`px-3 py-1 text-[12px] font-medium rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border/70 hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <ol className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredSnippets.length === 0 ? (
            <motion.li
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-sm text-muted-foreground py-12 text-center"
            >
              {snippets.length === 0
                ? "No snippets found. Start building your pocket memory."
                : "No snippets match your search."}
            </motion.li>
          ) : (
            filteredSnippets.map((snippet) => (
              <SnippetItem key={snippet.id} row={snippet} />
            ))
          )}
        </AnimatePresence>
      </ol>
    </div>
  );
};
