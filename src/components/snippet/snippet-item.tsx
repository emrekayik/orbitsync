"use client";

import { FC } from "react";
import clsx from "clsx";
import * as Evolu from "@evolu/common";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEvolu, type TodosRow } from "@/store/evolu";
import { todoSchema } from "@/schema/todo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const SnippetItem: FC<{
  row: TodosRow;
}> = ({ row: { id, title, isCompleted } }) => {
  const { update } = useEvolu();

  const handleToggleCompletedClick = () => {
    update("todo", {
      id,
      isCompleted: Evolu.booleanToSqliteBoolean(!isCompleted),
    });
  };

  const handleRenameClick = () => {
    const newTitle = window.prompt("Edit todo", title);
    if (newTitle == null) return;

    const parseResult = todoSchema.safeParse({ title: newTitle.trim() });
    if (!parseResult.success) {
      alert(parseResult.error.issues[0].message);
      return;
    }

    const result = update("todo", { id, title: parseResult.data.title });
    if (!result.ok) {
      alert("Bilinmeyen bir hata oluştu.");
    }
  };

  const handleDeleteClick = () => {
    update("todo", {
      id,
      // Soft delete with isDeleted flag (CRDT-friendly, preserves sync history).
      isDeleted: Evolu.sqliteTrue,
    });
  };

  return (
    <li className="-mx-2 flex items-center gap-3 px-2 py-2 hover:bg-gray-50">
      <Label className="flex flex-1 cursor-pointer items-center gap-3">
        <Input
          type="checkbox"
          checked={!!isCompleted}
          onChange={handleToggleCompletedClick}
          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
        />
        <span
          className={clsx(
            "flex-1 text-sm",
            isCompleted ? "text-gray-500 line-through" : "text-gray-900",
          )}
        >
          {title}
        </span>
      </Label>
      <div className="flex gap-1">
        <Button
          onClick={handleRenameClick}
          className="p-1 text-gray-400 transition-colors hover:text-blue-600"
          title="Edit"
        >
          <IconEdit className="size-4" />
        </Button>
        <Button
          onClick={handleDeleteClick}
          className="p-1 text-gray-400 transition-colors hover:text-red-600"
          title="Delete"
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </li>
  );
};
