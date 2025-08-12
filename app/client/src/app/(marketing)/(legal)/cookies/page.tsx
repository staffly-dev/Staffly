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
          Last updated: 10th August 2025
        </p>

        {/* Intro */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          This Cookies Policy explains how <strong>Staffly</strong> uses cookies
          and similar tracking technologies to enhance your browsing experience,
          improve our services, and deliver personalized content.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">What Are Cookies?</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Cookies are small text files stored on your device when you visit a
          website. They help websites remember your preferences and understand
          how you interact with the site.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">
          Types of Cookies We Use
        </h2>

        <h3 className="text-lg font-medium mt-6">1. Essential Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These cookies are necessary for the website to function properly. They
          enable features such as secure login, shopping cart functionality, and
          account management.
        </p>

        <h3 className="text-lg font-medium mt-6">2. Performance Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These cookies collect anonymous data about how visitors use our site,
          helping us improve site performance and user experience.
        </p>

        <h3 className="text-lg font-medium mt-6">3. Functional Cookies</h3>
        <p className="mt-4 text-muted-foreground">
          These cookies remember your preferences, such as language selection
          and display settings, to provide a more personalized experience.
        </p>

        <h3 className="text-lg font-medium mt-6">
          4. Targeting/Advertising Cookies
        </h3>
        <p className="mt-4 text-muted-foreground">
          These cookies are used to deliver relevant ads and track the
          effectiveness of our marketing campaigns. They may also be set by
          third-party advertising networks.
        </p>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">How We Use Cookies</h2>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>To keep you logged in to your account.</li>
          <li>To remember your shopping cart items.</li>
          <li>To analyze site traffic and usage patterns.</li>
          <li>To personalize your experience and show relevant offers.</li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">
          Managing Your Cookie Preferences
        </h2>
        <p className="mt-4 text-muted-foreground">
          You can control and manage cookies through your browser settings. Most
          browsers allow you to block or delete cookies, but doing so may affect
          the functionality of our website.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">Third-Party Cookies</h2>
        <p className="mt-4 text-muted-foreground">
          Some cookies may be set by third-party services we use, such as
          analytics providers or advertisers. These third parties may use their
          cookies to collect information about your online activities across
          different websites.
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">
          Updates to This Cookies Policy
        </h2>
        <p className="mt-4 text-muted-foreground">
          We may update this policy from time to time. Any changes will be
          posted on this page with a new &quot;Last updated&quot; date.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have any questions about our use of cookies, please contact us
          at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Closing statement */}
        <p className="mt-8 font-medium text-center">
          By continuing to use Staffly, you acknowledge and agree to our use of
          cookies as described in this policy.
        </p>
      </div>
    </div>
  );
}
