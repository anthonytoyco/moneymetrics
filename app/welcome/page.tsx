import { WelcomeForm } from "@/components/forms/form-welcome";
import { initProfile } from "@/app/client-actions";

export default async function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Welcome to MoneyMetrics</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your name and username to get started.
        </p>
        <WelcomeForm onSubmit={initProfile} />
      </div>
    </div>
  );
}
