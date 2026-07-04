"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

export default function MigrationComponentsShowcase() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="min-h-screen p-8 bg-background text-foreground space-y-12 max-w-5xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-serif font-bold tracking-tight">Component Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Temporary migration page to verify styling, typography, dark mode, spacing, and interactive states.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-semibold border-b pb-2">Typography & Colors</h2>
        <div className="flex gap-4 flex-wrap">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-semibold border-b pb-2">Buttons (Elevation test)</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button onClick={() => toast("Migration successful!")}>Trigger Toast</Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description verifying spacing and typography.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit</Button>
            </CardFooter>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it styled correctly?</AccordionTrigger>
              <AccordionContent>Yes. It adheres to the exact design system tokens.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Are fonts working?</AccordionTrigger>
              <AccordionContent>Inter is used for sans, Poppins for serif headings.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-8">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Interactive</TabsTrigger>
              <TabsTrigger value="password">States</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="space-y-4 p-4 border rounded-md mt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="airplane-mode" className="flex flex-col space-y-1">
                  <span>Airplane Mode</span>
                  <span className="font-normal text-sm text-muted-foreground">Toggle test</span>
                </Label>
                <Switch id="airplane-mode" />
              </div>
              <div className="space-y-4 pt-4">
                <Label>Slider Volume</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </TabsContent>
            <TabsContent value="password">
              <div className="p-4 border rounded-md mt-4 space-y-4">
                <Progress value={33} />
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-8">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="space-y-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              
              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="r1" />
                  <Label htmlFor="r1">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="r2" />
                  <Label htmlFor="r2">Comfortable</Label>
                </div>
              </RadioGroup>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
