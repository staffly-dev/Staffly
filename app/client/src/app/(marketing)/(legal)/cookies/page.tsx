import React from "react";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="py-20 relative px-4">
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center">
        Cookies Policy
      </h1>

      {/* Main content container */}
      <div className="max-w-3xl mx-auto">
        {/* Last updated date */}
        <p className="text-sm mb-2 italic text-center">
          Last updated: 13th August 2025
        </p>

        {/* Intro */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          This Cookies Policy explains how <strong>Staffly</strong> uses cookies
          and similar tracking technologies to support secure logins, improve
          platform performance, and deliver a more personalized experience for
          HR teams and employees.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">What Are Cookies?</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Cookies are small text files stored on your device when you access our
          platform. They help us remember your preferences, keep your session
          active, and understand how you interact with Staffly’s HR management
          tools.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">Types of Cookies We Use</h2>

        <h3 className="text-lg font-medium mt-6">1. Essential Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These are necessary for Staffly to function securely and efficiently.
          They enable core features like user authentication, account access,
          and role-based permissions for HR operations.
        </p>

        <h3 className="text-lg font-medium mt-6">2. Performance Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These cookies collect anonymized data on how you use the platform,
          helping us optimize speed, reliability, and usability.
        </p>

        <h3 className="text-lg font-medium mt-6">3. Functional Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These remember your settings—such as language preferences, dashboard
          filters, and display options—to provide a tailored HR management
          experience.
        </p>

        <h3 className="text-lg font-medium mt-6">4. Analytics Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These help us track feature usage, employee engagement metrics, and
          platform performance, enabling data-driven improvements.
        </p>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">How We Use Cookies</h2>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>To keep you securely logged into your Staffly account</li>
          <li>To remember HR dashboard filters and search preferences</li>
          <li>To measure platform usage and improve efficiency</li>
          <li>To enhance collaboration features and workflow tools</li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">
          Managing Your Cookie Preferences
        </h2>
        <p className="mt-4 text-muted-foreground">
          You can manage or block cookies via your browser settings. However,
          disabling essential cookies may prevent you from using core HR
          features like secure login and employee data management.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">Third-Party Cookies</h2>
        <p className="mt-4 text-muted-foreground">
          Some cookies may come from trusted third-party services we use for
          hosting, analytics, or integration with payroll and HR tools. These
          providers may collect data in accordance with their own privacy
          policies.
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">
          Updates to This Cookies Policy
        </h2>
        <p className="mt-4 text-muted-foreground">
          We may update this policy as our platform evolves. Changes will be
          posted on this page with an updated "Last updated" date.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have any questions about how we use cookies, please contact us
          at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Closing statement */}
        <p className="mt-8 font-medium text-center">
          By continuing to use Staffly, you agree to our use of cookies as
          described in this policy.
        </p>
      </div>
    </div>
  );
}
