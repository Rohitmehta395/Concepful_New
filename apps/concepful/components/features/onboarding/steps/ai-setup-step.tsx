"use client";

import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";

const aiProvidersOptions = ["ChatGPT", "Claude", "Gemini", "Local Models", "Other"];

export function AiSetupStep({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">AI Collaboration Setup</h2>
        <p className="text-muted-foreground">Configure how we integrate AI into your workflow.</p>
      </div>

      <FormField control={form.control} name="aiSetup.providers" render={() => (
        <FormItem>
          <div className="mb-4"><FormLabel className="text-base">Which AI providers does your team currently use?</FormLabel></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiProvidersOptions.map((item) => (
              <FormField key={item} control={form.control} name="aiSetup.providers" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item)}
                      onCheckedChange={(checked) =>
                        checked
                          ? field.onChange([...field.value, item])
                          : field.onChange(field.value?.filter((v) => v !== item))
                      }
                    />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                </FormItem>
              )} />
            ))}
          </div>
        </FormItem>
      )} />

      <FormField control={form.control} name="aiSetup.usageNotes" render={({ field }) => (
        <FormItem>
          <FormLabel>How are you using AI today?</FormLabel>
          <FormControl>
            <Textarea className="min-h-[100px]" placeholder="e.g., Drafting copy, analyzing competitors..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <div className="space-y-6 pt-6 border-t">
        <FormField control={form.control} name="aiSetup.consentBrandMemory" render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Brand Memory Integration</FormLabel>
              <FormDescription>Allow Concepful to use uploaded materials to train your dedicated brand memory vector index.</FormDescription>
            </div>
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
          </FormItem>
        )} />

        <FormField control={form.control} name="aiSetup.consentAiWorkflows" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg bg-secondary/30">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" /></FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I consent to AI-assisted workflows</FormLabel>
              <FormDescription>
                I understand that Concepful utilizes a hybrid approach combining senior creative judgment with AI generation.
              </FormDescription>
            </div>
          </FormItem>
        )} />
      </div>

      <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
        <strong>Future-Ready:</strong> Secure vault integration for API keys and proprietary model connection will be configured after onboarding via our secure infrastructure.
      </div>
    </div>
  );
}
