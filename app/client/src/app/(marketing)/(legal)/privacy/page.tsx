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
          Last updated: 13th August 2025
        </p>

        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          At <strong>Staffly</strong>, we are committed to safeguarding your
          privacy and protecting the confidentiality of personal and
          organizational data. This Privacy Policy explains how we collect,
          store, use, and protect information when you use our HR management
          platform, mobile apps, and related services.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">1. Information We Collect</h2>

        <h3 className="text-lg font-medium mt-6">a. Personal Information</h3>
        <p className="mt-4 text-muted-foreground">
          When you create an account, manage employees, or use our services, we
          may collect information such as:
        </p>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>Full name, job title, and contact details</li>
          <li>Email address and phone number</li>
          <li>Employee records and payroll-related data</li>
          <li>Login credentials and account preferences</li>
        </ul>

        <h3 className="text-lg font-medium mt-6">b. Non-Personal Information</h3>
        <p className="mt-4 text-muted-foreground">
          We collect non-identifiable data such as device type, IP address,
          browser information, and usage analytics to improve our platform.
        </p>

        <h3 className="text-lg font-medium mt-6">c. Cookies & Tracking</h3>
        <p className="mt-4 text-muted-foreground">
          We use cookies and similar technologies to enhance your experience,
          store preferences, and analyze usage. You can control cookies through
          your browser settings.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>To operate and enhance Staffly’s HR management features</li>
          <li>To manage employee data, payroll, and performance tracking</li>
          <li>To provide analytics and reports for HR decision-making</li>
          <li>To ensure platform security and prevent unauthorized access</li>
          <li>To send service updates, notifications, and support messages</li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">
          3. Sharing Your Information
        </h2>
        <p className="mt-4 text-muted-foreground">
          We never sell your personal data. We may share it only:
        </p>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>With trusted service providers for hosting, storage, or payment processing</li>
          <li>When required by law or legal process</li>
          <li>In case of mergers, acquisitions, or business transfers</li>
        </ul>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">4. Data Security</h2>
        <p className="mt-4 text-muted-foreground">
          We use encryption, secure protocols, and access controls to protect
          your information. While we strive for maximum security, no online
          system is completely risk-free.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">5. Your Rights</h2>
        <p className="mt-4 text-muted-foreground">
          You have the right to:
        </p>
        <ul className="list-disc ml-6 mt-4 text-muted-foreground space-y-2">
          <li>Access and update your personal data</li>
          <li>Request deletion of your information</li>
          <li>Export your HR data in a portable format</li>
          <li>Withdraw consent for certain data processing</li>
        </ul>
        <p className="mt-4 text-muted-foreground">
          To exercise your rights, contact us at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">6. Employee Data Responsibility</h2>
        <p className="mt-4 text-muted-foreground">
          If you use Staffly to manage employee data, you are responsible for
          ensuring that the collection and processing of such data complies with
          applicable labor and privacy laws.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">7. Children’s Privacy</h2>
        <p className="mt-4 text-muted-foreground">
          Staffly is intended for use by businesses and organizations. We do not
          knowingly collect information from individuals under 18.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold mt-12">8. Changes to This Policy</h2>
        <p className="mt-4 text-muted-foreground">
          We may update this Privacy Policy to reflect changes in our practices
          or legal requirements. Updates will be posted here with a new "Last
          Updated" date.
        </p>

        {/* Section 9 */}
        <h2 className="text-2xl font-semibold mt-12">9. Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have questions or concerns about our privacy practices, please
          email us at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        <p className="mt-8 font-medium text-center">
          By using Staffly, you confirm that you have read, understood, and
          agree to this Privacy Policy.
        </p>
      </div>
    </div>
  );
}
