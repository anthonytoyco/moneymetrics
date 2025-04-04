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
} from "@/components/forms/form-message";

const formSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Please select a file",
    })
    .refine(
      (file) => {
        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        return validTypes.includes(file.type);
      },
      {
        message: "File must be a PDF or image (JPEG/PNG)",
      }
    ),
});

export type FileImportFormValues = z.infer<typeof formSchema>;

interface FileImportFormProps {
  onSubmit: (values: FileImportFormValues) => Promise<Message>;
}

export function FileImportForm({ onSubmit }: FileImportFormProps) {
  const [message, setMessage] = React.useState<Message | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const form = useForm<FileImportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const handleSubmit = async (values: FileImportFormValues) => {
    try {
      setIsProcessing(true);
      const result = await onSubmit(values);
      setMessage(result);
      if ("success" in result) {
        form.reset();
      }
    } catch (error) {
      setMessage({ error: "An unexpected error occurred" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {message && <MessageComponent message={message} />}
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Financial Document</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Upload a PDF or image of your financial document (bank
                statement, receipt, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button className="w-52" type="submit" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Upload & Analyze"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
