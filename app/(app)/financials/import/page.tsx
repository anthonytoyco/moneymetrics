"use client";

import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { FileImportForm } from "@/components/forms/form-import";
import { ImportTable } from "@/components/tables/import-table";
import { processFile } from "@/utils/gemini";
import { useState } from "react";

export default function Page() {
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleSubmit = async (values: { file: File }) => {
    try {
      const response = await processFile(values.file);
      const parsedTransactions = JSON.parse(response);
      // Add unique IDs to each transaction
      const transactionsWithIds = parsedTransactions.map(
        (t: any, index: number) => ({
          ...t,
          id: `temp-${index}`,
        })
      );
      setTransactions(transactionsWithIds);
      return { success: "File processed successfully" };
    } catch (error) {
      console.error("Error processing file:", error);
      return { error: "Failed to process file" };
    }
  };

  const handleImport = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <>
      <BreadcrumbHeader currentPage="Import" parentPage="Financials" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto max-w-2xl w-full">
          <h1 className="text-2xl font-bold mb-4">
            Import Financial Documents
          </h1>
          <p className="text-muted-foreground mb-6">
            Upload a PDF or image of your financial document (bank statement,
            receipt, etc.) and we'll extract the transactions for you using
            Google Gemini.
          </p>
          <FileImportForm onSubmit={handleSubmit} />
          {transactions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">
                Extracted Transactions
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Review and import the transactions below. Click the plus icon to
                add a transaction to your records.
              </p>
              <ImportTable data={transactions} onImport={handleImport} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
