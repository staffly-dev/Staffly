import React from "react";
import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <div className="py-20 relative px-4">
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center">
        Help Center
      </h1>

      {/* Main content container */}
      <div className="max-w-3xl mx-auto">
        <p className="text-sm mb-2 italic text-center">
          Last updated: 13th August 2025
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Welcome to the <strong>Staffly</strong> Help Center. Here you’ll find
          guides to get started, solutions to common HR management questions,
          and resources to help you make the most of our platform. Whether
          you’re setting up your company workspace or managing employees, we’re
          here to help every step of the way.
        </p>

        {/* Section 1: Getting Started */}
          <h2 className="text-2xl font-semibold mt-12">Getting Started</h2>
          <p className="text-muted-foreground mt-4">
            If you’re new to Staffly, these quick start resources will guide you
            through setting up your account, adding team members, and configuring
            your HR tools.
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
            <li>
              <Link href="/docs/creating-an-account" className="underline">
                Creating Your Company Account
              </Link>
            </li>
            <li>
              <Link href="/docs/adding-employees" className="underline">
                Adding Employees & Roles
              </Link>
            </li>
            <li>
              <Link href="/docs/dashboard-overview" className="underline">
                Navigating the Admin Dashboard
              </Link>
            </li>
            <li>
              <Link href="/docs/setting-up-payroll" className="underline">
                Setting Up Payroll
              </Link>
            </li>
          </ul>

        {/* Section 2: Frequently Asked Questions */}
          <h2 className="text-2xl font-semibold mt-12">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-4">
            Quick answers to the most common questions from HR managers, team
            leads, and employees.
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
            <li>
              <Link href="/faq" className="underline">
                How do I invite a new employee to Staffly?
              </Link>
            </li>
            <li>
              <Link href="/faq" className="underline">
                How does leave and attendance tracking work?
              </Link>
            </li>
            <li>
              <Link href="/faq" className="underline">
                How do I update payroll details or tax information?
              </Link>
            </li>
            <li>
              <Link href="/faq" className="underline">
                Can employees access their payslips online?
              </Link>
            </li>
          </ul>

        {/* Section 3: Policies & Guidelines */}
          <h2 className="text-2xl font-semibold mt-12">Policies & Guidelines</h2>
          <p className="text-muted-foreground mt-4">
            Stay informed about our policies, compliance measures, and your
            rights as a Staffly user.
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
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

        {/* Section 4: Contact Support */}
          <h2 className="text-2xl font-semibold mt-12">Contact Support</h2>
          <p className="text-muted-foreground mt-4">
            Still need help? Our support team is available to assist you with
            technical issues, HR tool setup, or troubleshooting.
          </p>
          <p className="text-muted-foreground mt-4">
            Email us at{" "}
            <Link href="mailto:stafflycompany@gmail.com" className="underline">
              stafflycompany@gmail.com
            </Link>{" "}
            or reach out via our{" "}
            <Link href="/contact" className="underline">
              contact form
            </Link>{" "}
            or direct assistance.
          </p>

        {/* Section 5: Community & Resources */}
          <h2 className="text-2xl font-semibold mt-12">Community & Resources</h2>
          <p className="text-muted-foreground mt-4">
            Learn how to get more out of Staffly by connecting with other users,
            exploring tips from HR experts, and following our latest updates.
          </p>
          <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
            <li>
              <Link href="/blog" className="underline">
                Staffly Blog & HR Insights
              </Link>
            </li>
            <li>
              <Link href="/community" className="underline">
                HR Community Forum
              </Link>
            </li>
            <li>
              <Link href="/tutorials" className="underline">
                Tutorials & How-To Guides
              </Link>
            </li>
          </ul>

        {/* Closing Note */}
        <p className="mt-12 font-medium text-center">
          We’re committed to making Staffly your trusted partner in HR and
          workforce management. Thank you for being part of our community.
        </p>
      </div>
    </div>
  );
}
