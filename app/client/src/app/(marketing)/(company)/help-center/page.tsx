import React from "react";
import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <div className="py-20 relative px-4">
      {/* Page Title */}
      <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center">
        Help Center
      </h1>

      {/* Container */}
      <div className="max-w-4xl mx-auto">
        {/* Intro */}
        <p className="text-lg text-muted-foreground leading-relaxed text-center mb-12">
          Welcome to the Staffly Help Center. Here you’ll find answers to common
          questions, guides to help you get started, and ways to contact our
          support team if you need extra assistance.
        </p>

        {/* Section 1: Getting Started */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            New to Staffly? Follow our quick start guides to learn the basics and
            make the most out of our platform.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
            <li>
              <Link href="/docs/creating-an-account" className="underline">
                Creating an Account
              </Link>
            </li>
            <li>
              <Link href="/docs/setting-up-your-profile" className="underline">
                Setting Up Your Profile
              </Link>
            </li>
            <li>
              <Link href="/docs/navigating-dashboard" className="underline">
                Navigating the Dashboard
              </Link>
            </li>
          </ul>
        </section>

        {/* Section 2: Frequently Asked Questions */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-4">
            Find quick answers to the most common questions from our users.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
            <li>
              <Link href="/faq" className="underline">
                How long does shipping take?
              </Link>
            </li>
            <li>
              <Link href="/faq" className="underline">
                What payment methods do you accept?
              </Link>
            </li>
            <li>
              <Link href="/faq" className="underline">
                How do I change or cancel my order?
              </Link>
            </li>
          </ul>
        </section>

        {/* Section 3: Policies & Guidelines */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Policies & Guidelines</h2>
          <p className="text-muted-foreground mb-4">
            Stay informed about how we operate and protect your rights as a
            customer.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
            <li>
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="underline">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link href="/security" className="underline">
                Security Policy
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="underline">
                Cookies Policy
              </Link>
            </li>
          </ul>
        </section>

        {/* Section 4: Contact Support */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
          <p className="text-muted-foreground mb-4">
            Can’t find the answer you’re looking for? Our customer support team
            is here to help.
          </p>
          <p className="text-muted-foreground">
            Email us at{" "}
            <Link href="mailto:stafflycompany@gmail.com" className="underline">
              stafflycompany@gmail.com
            </Link>{" "}
            or use our{" "}
            <Link href="/contact" className="underline">
              contact form
            </Link>{" "}
            to reach us directly.
          </p>
        </section>

        {/* Section 5: Community & Resources */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Community & Resources</h2>
          <p className="text-muted-foreground mb-4">
            Join our community to connect with other Staffly users, share
            experiences, and get tips.
          </p>
          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
            <li>
              <Link href="/blog" className="underline">
                Staffly Blog
              </Link>
            </li>
            <li>
              <Link href="/community" className="underline">
                Community Forum
              </Link>
            </li>
            <li>
              <Link href="/tutorials" className="underline">
                Tutorials & Guides
              </Link>
            </li>
          </ul>
        </section>

        {/* Closing Note */}
        <p className="mt-12 font-medium text-center">
          We’re here to ensure your experience with Staffly is smooth and
          successful. Thank you for choosing us.
        </p>
      </div>
    </div>
  );
}
