import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function MainAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex flex-col items-center gap-4">
      Hey, {user.email}!
      <div className="flex flex-col items-center gap-4">
        <Button asChild variant={"outline"}>
          <Link href="/data/charts">Go to App</Link>
        </Button>
        <form action={signOutAction}>
          <Button type="submit" variant={"outline"}>
            Sign out
          </Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
