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
          Last updated: 13th August 2025
        </p>

        {/* Intro */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Welcome to <strong>Staffly</strong>, your all-in-one HR Management
          and Workforce Collaboration platform. These Terms and Conditions
          outline the rules and guidelines for using our web application,
          mobile apps, and related services.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">1. Acceptance of Terms</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          By creating an account or using Staffly, you agree to comply with
          these Terms and Conditions. If you do not agree, you must discontinue
          use immediately.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">2. Changes to Terms</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          We may revise these terms from time to time to reflect changes in
          features, legal requirements, or business needs. Updates will be
          posted on this page with a revised "Last Updated" date. Continued use
          of Staffly indicates acceptance of changes.
        </p>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">3. Use of Services</h2>

        <h3 className="text-lg font-medium mt-6">a. Eligibility</h3>
        <p className="mt-4 text-muted-foreground">
          You must be at least 18 years old or have the legal capacity to enter
          into a binding contract in your jurisdiction.
        </p>

        <h3 className="text-lg font-medium mt-6">b. Account Registration</h3>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>Provide accurate and complete registration details.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>
            Notify us promptly if you detect unauthorized account activity.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-6">c. Acceptable Use</h3>
        <p className="mt-4 text-muted-foreground">
          You agree not to misuse Staffly for activities including:
        </p>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>Sharing false, discriminatory, or harmful content.</li>
          <li>Uploading malicious code or unauthorized scripts.</li>
          <li>Attempting to bypass security or access other accounts.</li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">
          4. HR Management & Collaboration
        </h2>

        <h3 className="text-lg font-medium mt-6">a. Employee Data</h3>
        <p className="mt-4 text-muted-foreground">
          You are responsible for ensuring that employee data entered into
          Staffly complies with applicable data protection laws.
        </p>

        <h3 className="text-lg font-medium mt-6">b. Task & Workflow Tools</h3>
        <p className="mt-4 text-muted-foreground">
          Task assignment, performance tracking, and workflow features must be
          used for lawful workplace purposes only.
        </p>

        <h3 className="text-lg font-medium mt-6">c. AI-Powered Insights</h3>
        <p className="mt-4 text-muted-foreground">
          AI-generated reports and analytics are intended to assist HR
          decision-making and should not replace professional judgment.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">5. User Content</h2>

        <h3 className="text-lg font-medium mt-6">Ownership</h3>
        <p className="mt-4 text-muted-foreground">
          You retain ownership of all HR data and content uploaded. By using
          Staffly, you grant us a license to store, process, and display your
          data for operational purposes.
        </p>

        <h3 className="text-lg font-medium mt-6">Responsibility</h3>
        <p className="mt-4 text-muted-foreground">
          You are solely responsible for the accuracy and legality of the data
          you provide. We are not liable for errors or omissions in user
          content.
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">6. Privacy</h2>
        <p className="mt-4 text-muted-foreground">
          Your privacy is important. Please review our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          to understand how we collect, store, and process your information.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">7. Termination</h2>
        <p className="mt-4 text-muted-foreground">
          We reserve the right to suspend or terminate accounts that violate
          these terms or engage in fraudulent activity.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold mt-12">
          8. Disclaimers & Limitations of Liability
        </h2>

        <h3 className="text-lg font-medium mt-6">No Warranties</h3>
        <p className="mt-4 text-muted-foreground">
          Staffly is provided on an “as is” basis. We make no guarantees
          regarding uninterrupted or error-free service.
        </p>

        <h3 className="text-lg font-medium mt-6">Limitation of Liability</h3>
        <p className="mt-4 text-muted-foreground">
          We are not liable for indirect, incidental, or consequential damages
          arising from your use of Staffly.
        </p>

        {/* Section 9 */}
        <h2 className="text-2xl font-semibold mt-12">9. Governing Law</h2>
        <p className="mt-4 text-muted-foreground">
          These terms are governed by the laws of Egypt, without regard to
          conflict of law principles.
        </p>

        {/* Section 10 */}
        <h2 className="text-2xl font-semibold mt-12">10. Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          For any inquiries, please contact us at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Closing Statement */}
        <p className="mt-8 font-medium text-center">
          By using Staffly, you acknowledge that you have read, understood, and
          agree to these Terms and Conditions.
        </p>
      </div>
    </div>
  );
}
