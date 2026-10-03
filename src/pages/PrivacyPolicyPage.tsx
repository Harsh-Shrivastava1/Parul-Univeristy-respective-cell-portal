import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
  Lock,
  Cookie,
  Bell,
  Mail,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/login"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
          >
            <img
              src="/parul-university-logo.svg"
              alt="Parul University"
              className="h-9 w-auto"
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Respective Cell Portal
              </span>
              <span className="text-sm font-semibold text-[#1e5bce]">
                Coordinator Workspace
              </span>
            </div>
          </Link>

          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Document Header */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 justify-center sm:justify-start">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold px-2.5 py-0.5 text-xs">
              Portal Documentation
            </Badge>
            <span className="text-xs font-medium text-slate-500">
              Official Reference • September 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            Information and data privacy guidelines for Cell Heads and Department Coordinators using the Parul University Respective Cell Portal.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8">
          {/* Section 1: Overview & Scope */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold">1. Overview and Operational Scope</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                The Parul University Respective Cell Portal is an internal administrative platform dedicated to authorized Cell Heads and Department Coordinators. Its purpose is to facilitate the structured coordination, scheduling, monitoring, and evaluation of university training for students assigned to respective academic departments by the Parul University Internship Cell.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                This policy outlines how user account information, student records, training documentation, and portal activity are processed within the system to ensure responsible usage and maintain academic integrity.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Information Handled */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-xl font-bold">2. Information Handled in the Portal</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                The portal processes only the operational information necessary to execute departmental training workflows:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <UserCheck size={16} className="text-blue-600" />
                    Coordinator Account Data
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Coordinator name, official university email address, assigned department, and authentication credentials provisioned by University Administration.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <GraduationCap size={16} className="text-blue-600" />
                    Assigned Student Records
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Student name, enrollment number, academic branch, contact details, and application status provided by the Internship Cell for assigned students.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <ClipboardCheck size={16} className="text-blue-600" />
                    Training & Evaluation Details
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Assigned mentor, training module, reporting location, schedule, duration, attendance records, performance ratings, and evaluation feedback.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <Bell size={16} className="text-blue-600" />
                    Operational Communications
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In-app system notifications regarding newly assigned students, training commencement, and pending evaluations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: How Information is Used */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck size={20} />
                </div>
                <h2 className="text-xl font-bold">3. How Information is Used</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Information accessed or entered in this portal is used strictly for university academic and training administration:
              </p>
              <ul className="space-y-2.5 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong className="text-slate-800">Training Management:</strong> Setting up training modules, mentors, schedules, and reporting locations for assigned students.
                </li>
                <li>
                  <strong className="text-slate-800">Attendance & Progress Tracking:</strong> Generating official training attendance documentation and recording completion milestones.
                </li>
                <li>
                  <strong className="text-slate-800">Academic Evaluation:</strong> Submitting objective performance ratings, feedback, and recommendations upon training conclusion.
                </li>
                <li>
                  <strong className="text-slate-800">Workflow Handoff:</strong> Securely returning completed training records to the Central Internship Cell / TEC Cell for final internship processing.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4: Authentication & Session Data */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Cookie size={20} />
                </div>
                <h2 className="text-xl font-bold">4. Authentication and Session Management</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                To safeguard coordinator accounts and student data, the portal implements standard security practices:
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Secure Session Cookies:</strong> Encrypted, HTTP-only session cookies are used exclusively to maintain authenticated coordinator sessions while interacting with the portal. These cookies expire automatically upon logout or inactivity.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Local Browser Storage:</strong> Minimal non-sensitive preferences (such as sidebar collapse state and UI theme state) are cached locally in your browser to maintain a smooth user experience.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">System Activity Audit:</strong> Critical actions (such as logins, starting training, generating attendance forms, and submitting evaluations) are logged with timestamps to maintain institutional accountability and academic audit readiness.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5: Access Control & Role Boundaries */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold">5. Access Control and Role Boundaries</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access within the portal is partitioned by department:
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    Department Coordinators and Cell Heads are granted access only to records of students assigned specifically to their department.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    The Respective Cell manages training execution and evaluation. Final internship completion, company placement status, and certificate issuance are processed centrally by the Internship Cell.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 6: Coordinator Responsibilities */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold">6. Coordinator Data Protection Responsibilities</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                All authorized coordinators are expected to uphold university privacy standards:
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    Keep login credentials confidential. Do not share coordinator passwords or allow unassigned individuals to use your account.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    Treat student personal and academic information with strict confidentiality. Do not export, distribute, or use student records outside official university duties.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    Log out of the portal when completing work, especially when using shared workstations or laboratory computers.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: Questions and Administrative Support */}
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Mail size={18} />
                </div>
                <h2 className="text-lg font-bold">7. Support and Administrative Inquiries</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                For questions regarding coordinator account provisioning, department access permissions, password resets, or portal functionality, please contact the central Internship Cell:
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
                <a
                  href="mailto:internshipcell@paruluniversity.ac.in"
                  className="inline-flex items-center gap-1.5 text-[#1e5bce] hover:underline font-semibold"
                >
                  <Mail size={14} />
                  internshipcell@paruluniversity.ac.in
                </a>
                <span className="text-slate-300">•</span>
                <a
                  href="/Parul%20University%20-%20Respective%20Cell%20Portal%20-%20Cell%20Head%20User%20Guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
                >
                  <BookOpen size={14} />
                  Cell Head User Guide (PDF)
                  <ExternalLink size={12} />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Return Button */}
        <div className="mt-12 text-center">
          <Link to="/login">
            <Button
              className="bg-[#1e5bce] hover:bg-[#1a4db3] text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm gap-2"
            >
              <ArrowLeft size={16} />
              Return to Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/privacy-policy" className="text-slate-900 font-bold">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <a
              href="/Parul%20University%20-%20Respective%20Cell%20Portal%20-%20Cell%20Head%20User%20Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Help Desk
            </a>
          </div>
          <span className="text-slate-400 font-medium">
            © 2026 Parul University. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
