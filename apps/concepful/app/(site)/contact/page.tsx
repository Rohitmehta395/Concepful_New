import { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Concepful",
  description: "Get in touch with the Concepful team.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-24 sm:py-32 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-8">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
        Get in Touch
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground max-w-2xl">
        We're currently building out this page. In the meantime, you can reach us directly via email.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="mailto:hello@concepful.com"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
        >
          Email Us
        </a>
      </div>
    </div>
  );
}
