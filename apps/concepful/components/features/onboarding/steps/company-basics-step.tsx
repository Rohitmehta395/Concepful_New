"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";

export function CompanyBasicsStep({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Company Basics</h2>
        <p className="text-muted-foreground">Tell us about your organization and how to reach you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={form.control} name="company.name" render={({ field }) => (
          <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="company.website" render={({ field }) => (
          <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="company.industry" render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="technology">Technology / SaaS</SelectItem>
                <SelectItem value="ecommerce">E-commerce / Retail</SelectItem>
                <SelectItem value="finance">Financial Services</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="media">Media / Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="company.size" render={({ field }) => (
          <FormItem>
            <FormLabel>Company Size</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="1-10">1–10 employees</SelectItem>
                <SelectItem value="11-50">11–50 employees</SelectItem>
                <SelectItem value="51-200">51–200 employees</SelectItem>
                <SelectItem value="200+">200+ employees</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={form.control} name="contact.name" render={({ field }) => (
          <FormItem><FormLabel>Primary Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="contact.email" render={({ field }) => (
          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="contact.phone" render={({ field }) => (
          <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    </div>
  );
}
