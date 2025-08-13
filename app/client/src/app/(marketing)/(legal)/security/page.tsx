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
          Last updated: 10th August 2025
        </p>

        {/* Intro */}
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          At <strong>Staffly</strong>, we take the security of our users and their
          data very seriously. This Security Policy explains the measures we
          take to protect your information and ensure a safe experience while
          using our platform.
        </p>

        {/* Section 1 */}
        <h2 className="text-2xl font-semibold mt-12">Data Protection</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          All personal and transactional data is encrypted during transmission
          using industry-standard TLS (Transport Layer Security) protocols. We
          store sensitive information in secure environments with restricted
          access and strong authentication measures.
        </p>

        {/* Section 2 */}
        <h2 className="text-2xl font-semibold mt-12">Account Security</h2>
        <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
          <li>All passwords are stored using strong hashing algorithms.</li>
          <li>
            We encourage the use of strong, unique passwords and support
            multi-factor authentication (MFA) for added protection.
          </li>
          <li>
            Users are notified of any suspicious activity or login attempts from
            new devices.
          </li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-2xl font-semibold mt-12">
          Infrastructure Security
        </h2>
        <p className="mt-4 text-muted-foreground">
          Our servers are hosted in secure data centers with 24/7 monitoring,
          biometric access controls, and redundant power/network systems to
          ensure maximum uptime and safety.
        </p>

        {/* Section 4 */}
        <h2 className="text-2xl font-semibold mt-12">Application Security</h2>
        <p className="mt-4 text-muted-foreground">
          We follow secure coding practices and conduct regular security audits,
          penetration testing, and vulnerability scanning to detect and fix
          potential issues before they can be exploited.
        </p>

        {/* Section 5 */}
        <h2 className="text-2xl font-semibold mt-12">
          Cookies and Tracking Technologies
        </h2>
        <p className="mt-4 text-muted-foreground">
          We use cookies and similar technologies to enhance your experience,
          improve site performance, and protect against fraudulent activity.
          Learn more in our{" "}
          <Link href="/cookies" className="underline">
            Cookies Policy
          </Link>
          .
        </p>

        {/* Section 6 */}
        <h2 className="text-2xl font-semibold mt-12">Incident Response</h2>
        <p className="mt-4 text-muted-foreground">
          In the event of a security breach, we have an incident response plan
          in place to quickly contain the threat, assess the impact, and notify
          affected users as required by law.
        </p>

        {/* Section 7 */}
        <h2 className="text-2xl font-semibold mt-12">Your Role in Security</h2>
        <p className="mt-4 text-muted-foreground">
          Security is a shared responsibility. You can help protect your account
          by keeping your login credentials private, enabling MFA, and regularly
          updating your password.
        </p>

        {/* Section 8 */}
        <h2 className="text-2xl font-semibold mt-12">Contact Us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have any questions, concerns, or discover any security
          vulnerabilities, please contact our security team at{" "}
          <Link href="mailto:stafflycompany@gmail.com" className="underline">
            stafflycompany@gmail.com
          </Link>
          .
        </p>

        {/* Closing Statement */}
        <p className="mt-8 font-medium text-center">
          By using Staffly, you acknowledge and agree to our security practices as
          described in this policy.
        </p>
      </div>
    </div>
  );
}
