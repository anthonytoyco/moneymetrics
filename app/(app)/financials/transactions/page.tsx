import { createTransaction } from "@/app/client-actions";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { TransactionsTable } from "@/components/tables/transactions-table";
import { TransactionForm } from "@/components/forms/form-transaction";
import { createClient } from "@/utils/supabase/server";
import { Transaction, columns } from "./columns";

async function getData(): Promise<Transaction[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export default async function Page() {
  const data = await getData();

  return (
    <>
      <BreadcrumbHeader currentPage="Transactions" parentPage="Financials" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto max-w-2xl w-full">
          <h1 className="text-2xl font-bold mb-4">Add a New Transaction</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Add a new transaction to your records.
          </p>
          <TransactionForm onSubmit={createTransaction} />
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Your Transactions</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Review your transactions below. Click the dots icon to delete a
              transaction.
            </p>
            <TransactionsTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
