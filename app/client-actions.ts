"use client";

import { createClient } from "@/utils/supabase/client";
import { type WelcomeFormValues } from "@/components/form-welcome";
import { type TransactionFormValues } from "@/components/form-transaction";

export async function initProfile(values: WelcomeFormValues) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return { error: "Failed to get user information" };
    }

    if (!user) {
      return { error: "No user found" };
    }

    const { username, name, avatar } = values;
    let avatarUrl = null;

    if (avatar instanceof File) {
      const fileExt = avatar.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatar);

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        return { error: "Failed to upload avatar" };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      avatarUrl = publicUrl;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        avatar_url: avatarUrl,
      },
    });

    if (authError) {
      console.error("Error updating auth user:", authError);
      return { error: "Failed to update user profile" };
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      name,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return { error: "Failed to update profile in database" };
    }

    window.location.reload();
    return { success: "Profile updated successfully!" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function createTransaction(values: TransactionFormValues) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return { error: "Failed to get user information" };
    }

    if (!user) {
      return { error: "No user found" };
    }

    const { title, description, amount, category, date } = values;

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        title,
        description,
        amount: Number(amount),
        category,
        date: new Date(date).toISOString(),
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return { error: "Failed to create transaction" };
    }

    window.location.reload();
    return { success: "Transaction created successfully!" };
  } catch (error) {
    console.error("Transaction creation error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);
  if (deleteError) {
    console.error("Error deleting transaction:", deleteError);
    return { error: "Failed to delete transaction" };
  }
  window.location.reload();
  return { success: "Transaction deleted successfully!" };
}
