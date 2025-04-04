"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { createTransaction } from "@/app/client-actions";
import { DataTableColumnHeader } from "@/components/tables/table-header";
import { Button } from "@/components/ui/button";

export type ImportTransaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

export const columns: ColumnDef<ImportTransaction>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <div className={amount >= 0 ? "text-green-600" : "text-red-600"}>
          {amount >= 0 ? "+" : "-"}${Math.abs(amount).toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      const formatted = category
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      return (
        <div className="font-bold italic border border-gray-300 rounded-md px-2 py-1">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              await createTransaction(
                {
                  title: transaction.title,
                  amount: transaction.amount.toString(),
                  category: transaction.category,
                  date: transaction.date,
                  description: transaction.description || "",
                },
                false
              );
              // Call onImport to remove the row from the table
              const onImport = (row.original as any).onImport;
              if (onImport) {
                onImport(transaction.id);
              }
            } catch (error) {
              console.error("Error importing transaction:", error);
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      );
    },
  },
];
