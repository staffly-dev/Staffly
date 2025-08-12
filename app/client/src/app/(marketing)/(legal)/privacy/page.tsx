import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="py-20 relative px-4">
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center">
        Privacy Policy
      </h1>

      {/* Main content container */}
      <div className="max-w-3xl mx-auto">
        <p className="text-sm mb-2 italic text-center">
          Last updated: 10th August 2025
        </p>

        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          At <strong>Staffly</strong>, we are committed to protecting your privacy
          and ensuring that your personal information remains secure. This
          Privacy Policy explains how we collect, use, disclose, and safeguard
          your data when you use our website, mobile applications, and related
          services.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">Information We Collect</h2>

        <h3 className="text-lg font-medium mt-6">1. Personal Information</h3>
        <p className="mt-4 text-muted-foreground">
          When you register for an account, place an order, or use our services,
          we may collect personal details such as your name, email address,
          shipping/billing address, phone number, and payment information.
        </p>

        <h3 className="text-lg font-medium mt-6">
          2. Non-Personal Information
        </h3>
        <p className="mt-4 text-muted-foreground">
          We also collect non-identifiable data such as your IP address, browser
          type, device information, and browsing patterns to improve our
          services.
        </p>

        <h3 className="text-lg font-medium mt-6">
          3. Cookies & Tracking Technologies
        </h3>
        <p className="mt-4 text-muted-foreground">
          We use cookies and similar technologies to store your preferences and
          track interactions with our platform. You can manage these through
          your browser settings.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">
          How We Use Your Information
        </h2>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>To provide, operate, and improve our products and services.</li>
          <li>To process orders, payments, and deliver your purchases.</li>
          <li>To personalize your shopping experience.</li>
          <li>
            To send updates, promotions, and important service information.
          </li>
          <li>To respond to inquiries and provide customer support.</li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">
          Sharing Your Information
        </h2>
        <p className="mt-4 text-muted-foreground">
          We do not sell your personal information. We may share your data only
          in the following cases:
        </p>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>
            With trusted service providers (payment processors, hosting,
            shipping partners) to operate our services.
          </li>
          <li>When required by law, regulation, or legal process.</li>
          <li>
            In connection with business transactions such as mergers or
            acquisitions.
          </li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">Data Security</h2>
        <p className="mt-4 text-muted-foreground">
          We implement industry-standard encryption, firewalls, and secure
          protocols to protect your information. While we strive to ensure the
          highest level of security, no method of transmission over the internet
          is completely risk-free.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">Your Rights</h2>
        <p className="mt-4 text-muted-foreground">You have the right to:</p>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>Access, update, or correct your personal data.</li>
          <li>Opt-out of marketing communications.</li>
          <li>Request deletion of your personal information.</li>
        </ul>
        <p className="mt-4 text-muted-foreground">
          To exercise these rights, contact us at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">Children’s Privacy</h2>
        <p className="mt-4 text-muted-foreground">
          Our services are not directed to individuals under 18. We do not
          knowingly collect data from minors. If we discover such data, it will
          be deleted immediately.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">Changes to This Policy</h2>
        <p className="mt-4 text-muted-foreground">
          We may update this Privacy Policy periodically. Updates will be
          reflected on this page with a revised &quot;Last updated&quot; date.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold mt-12">Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have any questions or concerns about our privacy practices,
          please reach out at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        <p className="mt-8 font-medium text-center">
          By using Staffly, you acknowledge that you have read and agree to this
          Privacy Policy.
        </p>
      </div>
    </div>
  );
}
