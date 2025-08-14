import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Users,
  Building2,
  FileText,
  Calendar,
  BarChart3,
  Target,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Database,
  PieChart,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
            <Badge variant="secondary" className="text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Secure
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Fast
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Reliable
            </Badge>
          </div>
        </div>
      </section>

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
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Employee Profiles</CardTitle>
                <CardDescription>
                  Centralized employee records with comprehensive information
                  management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Personal & professional details
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Document storage & management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Performance history tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">Department Management</CardTitle>
                <CardDescription>
                  Organize your workforce with flexible department structures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Hierarchical organization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Role-based permissions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Team collaboration tools
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">
                  Onboarding/Offboarding
                </CardTitle>
                <CardDescription>
                  Streamlined processes for smooth employee transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Automated workflows
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Checklist management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Compliance tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HR Operations Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
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
            <Card className="border-border hover:shadow-md transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="w-5 h-5 text-chart-1" />
                </div>
                <CardTitle className="text-base">Payroll Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated payroll processing with tax calculations and
                  compliance
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-5 h-5 text-chart-2" />
                </div>
                <CardTitle className="text-base">Leave Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive leave tracking with approval workflows
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-5 h-5 text-chart-3" />
                </div>
                <CardTitle className="text-base">Attendance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time check-in/out with geolocation and reporting
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow text-center">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-5 h-5 text-chart-4" />
                </div>
                <CardTitle className="text-base">
                  Performance Evaluations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Structured performance reviews with goal setting and tracking
                </p>
              </CardContent>
            </Card>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
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
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Dashboard Analytics</CardTitle>
                <CardDescription>
                  Real-time insights into your HR metrics and KPIs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Employee turnover rates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Hiring funnel analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Performance trends
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <PieChart className="w-5 h-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">Reporting & Insights</CardTitle>
                <CardDescription>
                  Comprehensive reports for compliance and strategic planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Custom report builder
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Automated report scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Export to multiple formats
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
                <CardDescription>
                  Track and optimize your HR team&apos;s effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Time-to-hire tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Cost-per-hire analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />
                    Employee satisfaction scores
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Start Free Trial
            </button>
            <button className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
