"use client";

import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";

const improvementsOptions = [
  "Brand consistency", 
  "Campaign performance", 
  "Design velocity", 
  "Strategic direction", 
  "AI integration", 
  "Content volume"
];

const prioritiesOptions = [
  "Social assets", 
  "Campaign systems", 
  "Brand identity", 
  "Presentations", 
  "Motion graphics", 
  "Strategy"
];

export function StrategicGoalsStep({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Strategic Goals</h2>
        <p className="text-muted-foreground">What brings you to Concepful?</p>
      </div>

      <FormField control={form.control} name="goals.improvements" render={() => (
        <FormItem>
          <div className="mb-4"><FormLabel className="text-base">What are you trying to improve?</FormLabel></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {improvementsOptions.map((item) => (
              <FormField key={item} control={form.control} name="goals.improvements" render={({ field }) => (
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

      <FormField control={form.control} name="goals.painPoints" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">What feels unclear right now?</FormLabel>
          <FormControl>
            <Textarea className="min-h-[100px]" placeholder="Briefly describe your current creative challenges..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="goals.firstPriorities" render={() => (
        <FormItem>
          <div className="mb-4"><FormLabel className="text-base">What kind of work do you need first?</FormLabel></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prioritiesOptions.map((item) => (
              <FormField key={item} control={form.control} name="goals.firstPriorities" render={({ field }) => (
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
    </div>
  );
}
