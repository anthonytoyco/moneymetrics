"use client";

import { createClient } from "@/utils/supabase/client";
import { type FormValues } from "@/components/welcome-form";

export async function initProfile(values: FormValues) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error("Failed to get user information");
    }

    if (!user) {
      throw new Error("No user found");
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
        throw new Error("Failed to upload avatar");
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
      throw new Error("Failed to update user profile");
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
      throw new Error("Failed to update profile in database");
    }

    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
}
