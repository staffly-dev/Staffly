import { Badge } from "@/components/ui/badge";

import {
  CheckCircle2,
  Users,
  FileText,
  Calendar,
  Shield,
  Zap,
  Database,
} from "lucide-react";
import Link from "next/link";
import { features, hrOperations, businessIntelligence } from "@/constants";
import { HROperationsCard } from "./components/OperationsCard";
import { EmployeeFeaturesCard } from "./components/EmployeeFeaturesCard";

export default function FeaturesPage({
  isHomepage = false,
}: {
  isHomepage?: boolean;
}) {
  return (
    <div>
      {/* Hero Section */}
      {!isHomepage && (
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything you need to
              <span className="text-primary block">manage your team</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Streamline HR operations with our comprehensive suite of tools for
              employee management, recruitment, and business intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Secure
              </Badge>
              <Badge className="text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Easy
              </Badge>
              <Badge className="text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Reliable
              </Badge>
            </div>
          </div>
        </section>
      )}
      {/* Employee Management Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Employee Management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete control over your workforce with comprehensive employee
              lifecycle management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <EmployeeFeaturesCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* HR Operations Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              HR Operations
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Automate and streamline your core HR processes for maximum
              efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hrOperations.map((operation) => (
              <HROperationsCard key={operation.title} {...operation} />
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment & Hiring Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Recruitment & Hiring
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find and hire the best talent with our comprehensive ATS solution
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Job Posting & Management
                  </h3>
                  <p className="text-muted-foreground">
                    Create compelling job postings, manage multiple openings,
                    and distribute across job boards automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Candidate Tracking
                  </h3>
                  <p className="text-muted-foreground">
                    Track candidates through the entire hiring pipeline with
                    detailed progress monitoring and communication history.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Application Processing
                  </h3>
                  <p className="text-muted-foreground">
                    Streamlined application review with AI-powered screening,
                    resume parsing, and candidate scoring.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-chart-5/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-chart-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Interview Scheduling
                  </h3>
                  <p className="text-muted-foreground">
                    Automated interview coordination with calendar integration,
                    reminders, and feedback collection.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Smart Hiring Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">
                    AI-powered candidate matching
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">
                    Automated interview scheduling
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">
                    Resume parsing & analysis
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">
                    Multi-channel job distribution
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Intelligence Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Business Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Make data-driven decisions with comprehensive analytics and
              insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {businessIntelligence.map((biFeature) => (
              <EmployeeFeaturesCard key={biFeature.title} {...biFeature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isHomepage && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5 border-t border-primary/10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join companies using Staffly to streamline their HR processes and
              build better teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
