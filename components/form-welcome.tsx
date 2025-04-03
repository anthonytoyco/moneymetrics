"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  FormMessage as MessageComponent,
  type Message,
} from "@/components/form-message";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  avatar: z.any().optional(),
});

export type WelcomeFormValues = z.infer<typeof formSchema>;

interface WelcomeFormProps {
  onSubmit: (values: WelcomeFormValues) => Promise<Message>;
}

export function WelcomeForm({ onSubmit }: WelcomeFormProps) {
  const [message, setMessage] = React.useState<Message | null>(null);
  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      avatar: undefined,
    },
  });

  const handleSubmit = async (values: WelcomeFormValues) => {
    try {
      const result = await onSubmit(values);
      setMessage(result);
      if ("success" in result) {
        form.reset();
      }
    } catch (error) {
      setMessage({ error: "An unexpected error occurred" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {message && <MessageComponent message={message} />}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>This is your unique username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Avatar (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription>Upload a profile picture.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button className="w-52" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
