import * as Evolu from "@evolu/common";
import { createUseEvolu } from "@evolu/react";
import { evoluReactWebDeps } from "@evolu/react-web";
import { toast } from "sonner";

const TodoId = Evolu.id("Todo");
type TodoId = typeof TodoId.Type;

const SnippetId = Evolu.id("Snippet");
type SnippetId = typeof SnippetId.Type;

const Schema = {
  todo: {
    id: TodoId,
    title: Evolu.NonEmptyString100,
    isCompleted: Evolu.nullOr(Evolu.SqliteBoolean),
  },
  snippet: {
    id: SnippetId,
    title: Evolu.NonEmptyString100,
    content: Evolu.NonEmptyString100,
    image: Evolu.nullOr(Evolu.NonEmptyString100),
    copyCount: Evolu.nullOr(Evolu.SqliteValue),
  },
};

export const evolu = Evolu.createEvolu(evoluReactWebDeps)(Schema, {
  name: Evolu.SimpleName.orThrow("snipsync"),
});

export const useEvolu = createUseEvolu(evolu);

evolu.subscribeError(() => {
  const error = evolu.getError();
  if (!error) return;

  toast.error("🚨 Evolu error occurred! Check the console.");
  console.error(error);
});

export const todosQuery = evolu.createQuery((db) =>
  db
    .selectFrom("todo")
    .select(["id", "title", "isCompleted"])
    .where("isDeleted", "is not", Evolu.sqliteTrue)
    .where("title", "is not", null)
    .$narrowType<{ title: Evolu.kysely.NotNull }>()
    .orderBy("createdAt"),
);

export const snippetsQuery = evolu.createQuery((db) =>
  db
    .selectFrom("snippet")
    .select(["id", "title", "content", "image", "copyCount", "isDeleted"])
    .where("isDeleted", "is not", Evolu.sqliteTrue)
    .where("title", "is not", null)
    .$narrowType<{ title: Evolu.kysely.NotNull }>()
    .orderBy("createdAt"),
);

export type TodosRow = typeof todosQuery.Row;
export type SnippetsRow = typeof snippetsQuery.Row;
