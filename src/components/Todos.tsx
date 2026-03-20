"use client";

import { FC, useState } from "react";
import { useQuery } from "@evolu/react";
import { useEvolu, todosQuery } from "@/store/evolu";
import { todoSchema } from "@/schema/todo";
import { Button } from "./ui/Button";
import { TodoItem } from "./TodoItem";
import { Input } from "./ui/input";

export const Todos: FC = () => {
  // useQuery returns live data - component re-renders when data changes.
  const todos = useQuery(todosQuery);
  const { insert } = useEvolu();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const addTodo = () => {
    const parseResult = todoSchema.safeParse({ title: newTodoTitle.trim() });

    if (!parseResult.success) {
      alert(parseResult.error.issues[0].message);
      return;
    }

    const result = insert(
      "todo",
      { title: parseResult.data.title },
      {
        onComplete: () => {
          setNewTodoTitle("");
        },
      },
    );

    if (!result.ok) {
      alert("Bilinmeyen bir hata oluştu.");
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <ol className="mb-6 space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} row={todo} />
        ))}
      </ol>

      <div className="flex gap-2">
        <Input
          type="text"
          value={newTodoTitle}
          onChange={(e) => {
            setNewTodoTitle(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodo();
          }}
          placeholder="Add a new todo..."
        />
        <Button onClick={addTodo}>Add</Button>
      </div>
    </div>
  );
};
