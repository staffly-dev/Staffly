import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="py-20 relative px-4">
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center">
        Terms and Conditions
      </h1>

      {/* Main content container */}
      <div className="max-w-3xl mx-auto">
        {/* Last updated date */}
        <p className="text-sm mb-2 italic text-center">
          Last updated: 10th August 2025
        </p>

        {/* Intro */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Welcome to <strong>Staffly</strong>. These Terms and Conditions outline
          the rules and regulations for using our website, mobile applications,
          and related services.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">Acceptance of Terms</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          By accessing and using Staffly, you agree to be bound by these terms and
          conditions. If you do not agree, you must not use our platform.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">Changes to Terms</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We may update these terms at any time. Changes will be reflected on
          this page with a revised &quot;Last updated&quot; date. Continued use
          after modifications constitutes acceptance.
        </p>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">Use of Services</h2>

        <h3 className="text-lg font-medium mt-6">1. Eligibility</h3>
        <p className="mt-4 text-muted-foreground">
          You must be at least 18 years old and capable of entering into a
          binding contract.
        </p>

        <h3 className="text-lg font-medium mt-6">2. Account Registration</h3>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>Provide accurate and complete information during sign-up.</li>
          <li>
            Keep your account credentials secure and confidential at all times.
          </li>
          <li>
            Notify us immediately if you suspect unauthorized access to your
            account.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-6">3. Acceptable Use</h3>
        <p className="mt-4 text-muted-foreground">
          You agree not to use Staffly for unlawful or prohibited activities,
          including but not limited to:
        </p>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>Uploading or sharing harmful, offensive, or illegal content.</li>
          <li>Distributing spam or malicious software.</li>
          <li>
            Attempting to gain unauthorized access to other accounts or Staffly’s
            systems.
          </li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">
          Project Management & Collaboration
        </h2>

        <h3 className="text-lg font-medium mt-6">Task Management</h3>
        <p className="mt-4 text-muted-foreground">
          Our tools allow task creation, assignment, and tracking. You must not
          use them for harmful or illegal activities.
        </p>

        <h3 className="text-lg font-medium mt-6">Analytics</h3>
        <p className="mt-4 text-muted-foreground">
          We provide analytics for projects and tasks. You agree to use this
          data responsibly and in compliance with privacy laws.
        </p>

        <h3 className="text-lg font-medium mt-6">Collaboration</h3>
        <p className="mt-4 text-muted-foreground">
          Collaboration features should not be used for malicious purposes.
        </p>

        <h3 className="text-lg font-medium mt-6">Business Transfers</h3>
        <p className="mt-4 text-muted-foreground">
          In the event of a merger or acquisition, your information may be
          transferred to the acquiring entity.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">User Content</h2>

        <h3 className="text-lg font-medium mt-6">Ownership</h3>
        <p className="mt-4 text-muted-foreground">
          You retain ownership of content you upload. By uploading, you grant
          Staffly a worldwide, non-exclusive, royalty-free license to use your
          content to operate our services.
        </p>

        <h3 className="text-lg font-medium mt-6">Responsibility</h3>
        <p className="mt-4 text-muted-foreground">
          You are solely responsible for your content. Staffly does not endorse or
          assume liability for user-generated content.
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">Privacy</h2>
        <p className="mt-4 text-muted-foreground">
          Your privacy is important to us. Please review our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          for details on how we handle your data.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">Termination</h2>
        <p className="mt-4 text-muted-foreground">
          We may suspend or terminate your account at our discretion, with or
          without notice, for any violation of these terms.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold mt-12">
          Disclaimers & Limitations of Liability
        </h2>

        <h3 className="text-lg font-medium mt-6">No Warranties</h3>
        <p className="mt-4 text-muted-foreground">
          Staffly is provided &quot;as is&quot; without warranties of any kind.
        </p>

        <h3 className="text-lg font-medium mt-6">Limitation of Liability</h3>
        <p className="mt-4 text-muted-foreground">
          We are not liable for indirect, incidental, or consequential damages
          resulting from your use of our services.
        </p>

        {/* Section 9 */}
        <h2 className="text-2xl font-semibold mt-12">Governing Law</h2>
        <p className="mt-4 text-muted-foreground">
          These terms are governed by the laws of Egypt, without regard to its
          conflict of law provisions.
        </p>

        {/* Section 10 */}
        <h2 className="text-2xl font-semibold mt-12">Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          For questions or concerns, contact us at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Closing Statement */}
        <p className="mt-8 font-medium text-center">
          By using Staffly, you confirm that you have read, understood, and agree
          to these Terms and Conditions.
        </p>
      </div>
    </div>
  );
}
