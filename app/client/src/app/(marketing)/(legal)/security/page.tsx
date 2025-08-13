import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="py-20 relative px-4">
      {/* Page Title */}
      <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center">
        Security Policy
      </h1>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto">
        {/* Last Updated Date */}
        <p className="text-sm mb-2 italic text-center">
          Last updated: 13th August 2025
        </p>

        {/* Intro */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          At <strong>Staffly</strong>, the security of your HR data is our highest
          priority. This Security Policy explains the safeguards and practices we
          use to protect sensitive employee and organizational information while
          you manage your workforce on our platform.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">Data Protection</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          All personal, payroll, and HR records are encrypted during transmission
          using industry-standard TLS (Transport Layer Security) protocols.
          Sensitive data is stored in encrypted databases within secure
          environments, accessible only by authorized personnel with strict
          role-based access controls.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">Account Security</h2>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>Passwords are stored using advanced hashing algorithms with salting.</li>
          <li>
            Multi-Factor Authentication (MFA) is supported to protect against
            unauthorized access.
          </li>
          <li>
            We actively monitor accounts for unusual login activity and notify
            users of suspicious sign-ins.
          </li>
          <li>
            Session timeouts are enforced to reduce the risk of unauthorized use
            from unattended devices.
          </li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">Infrastructure Security</h2>
        <p className="mt-4 text-muted-foreground">
          Our servers are hosted in enterprise-grade data centers with 24/7
          on-site security, biometric access controls, fire suppression systems,
          and redundant networking to ensure maximum uptime and resilience.
        </p>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">Application Security</h2>
        <p className="mt-4 text-muted-foreground">
          We follow secure coding standards and conduct routine vulnerability
          scans, penetration testing, and code reviews. Security patches are
          applied promptly to mitigate known risks.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">
          Compliance & Regulatory Standards
        </h2>
        <p className="mt-4 text-muted-foreground">
          Staffly’s data handling practices are designed to align with applicable
          privacy and security regulations, including GDPR and local labor laws.
          We ensure that employee data is stored and processed in compliance with
          these requirements.
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">Cookies & Tracking</h2>
        <p className="mt-4 text-muted-foreground">
          We use cookies and tracking technologies to secure sessions, prevent
          fraudulent activity, and improve the user experience. Learn more in our{" "}
          <Link href="/cookies" className="underline">
            Cookies Policy
          </Link>
          .
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">Incident Response</h2>
        <p className="mt-4 text-muted-foreground">
          In the event of a security incident, our dedicated team follows a
          documented incident response plan to quickly identify, contain, and
          resolve the issue. Affected users will be notified as required by law.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold mt-12">Your Role in Security</h2>
        <p className="mt-4 text-muted-foreground">
          Security is a shared responsibility. You can help by keeping your
          login credentials confidential, enabling MFA, and updating your
          password regularly. Avoid accessing your account from public or
          unsecured networks.
        </p>

        {/* Section 9 */}
        <h2 className="text-2xl font-semibold mt-12">Contact Our Security Team</h2>
        <p className="mt-4 text-muted-foreground">
          If you have any concerns, questions, or discover a potential
          vulnerability, please contact us at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Closing Statement */}
        <p className="mt-8 font-medium text-center">
          By using Staffly, you acknowledge and agree to our security measures as
          outlined in this policy.
        </p>
      </div>
    </div>
  );
}
