import HeaderAuth from "@/components/header-auth";

export default async function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex items-center justify-center gap-4">
        <HeaderAuth />
      </div>
    </main>
  );
}
