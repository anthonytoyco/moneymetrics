import { createTransaction } from "@/app/client-actions";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { DataTable } from "@/components/tables/data-table";
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
    <div className="flex flex-col flex-1">
      <BreadcrumbHeader currentPage="Transactions" parentPage="Financials" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4">Add a New Transaction</h2>
          <TransactionForm onSubmit={createTransaction} />
        </div>
        <div className="mx-auto max-w-2xl w-full">
          <DataTable
            columns={columns}
            data={data}
            filterColumn="title"
            filterPlaceholder="Filter transaction titles..."
          />
        </div>
      </div>
    </div>
  );
}
