import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  KeyRound,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Mail,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TermsPage: React.FC = () => {
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
              Portal Terms & Conditions
            </Badge>
            <span className="text-xs font-medium text-slate-500">
              Official Reference • September 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Terms of Use
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            Operational guidelines and conditions of use for Cell Heads and Department Coordinators using the Parul University Respective Cell Portal.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Portal URL:</span>
            <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              https://coordinator.internship.paruluniversity.ac.in
            </span>
          </div>
        </div>

        {/* Terms Body */}
        <div className="space-y-8">
          {/* Section 1: Purpose & Applicability */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-bold">1. Purpose and Applicability</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                The Parul University Respective Cell Portal is provided exclusively for authorized university faculty, Cell Heads, and Department Coordinators. It serves as the official departmental system for managing student training schedules, recording attendance, conducting evaluations, and coordinating training outcomes with the university's central Internship Cell.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                By accessing or signing in to this portal, you acknowledge and agree to comply with these terms, academic guidelines, and university information security policies.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Authorized Access & Credentials */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <KeyRound size={20} />
                </div>
                <h2 className="text-xl font-bold">2. Authorized Access & Account Responsibility</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access to coordinator accounts is granted by Parul University Administration and the Internship Cell:
              </p>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Authorized Personnel Only:</strong> Only formally appointed Cell Heads and Department Coordinators are authorized to access this portal.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Credential Confidentiality:</strong> You are responsible for maintaining the confidentiality of your login credentials. Temporary passwords provided upon account creation should be updated promptly via the portal's Change Password utility.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Account Sharing Prohibited:</strong> Coordinator accounts must never be shared, pooled, or delegated to unauthorized individuals, student trainees, or external parties.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3: Appropriate Use of Student Records */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={20} />
                </div>
                <h2 className="text-xl font-bold">3. Appropriate Use of Student Information</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Student details visible within the portal—including enrollment numbers, academic branches, contact information, and training assignments—are confidential university records provided solely for educational coordination.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Student records must only be accessed to facilitate assigned training activities.</li>
                <li>Information must not be copied, exported, or distributed outside official academic channels.</li>
                <li>Student personal details must not be used for personal, commercial, or non-university purposes.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4: Accuracy of Information & Evaluations */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-xl font-bold">4. Accuracy of Training Information and Evaluations</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                As a Department Coordinator, you are responsible for the factual accuracy and academic fairness of all entries made under your account:
              </p>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Training Details:</strong> Ensure that mentor names, training modules, reporting locations, reporting times, joining dates, and duration are accurately recorded.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Attendance Verification:</strong> Verify student training attendance objectively. Official attendance forms generated via the portal must accurately reflect actual student participation.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">Performance Evaluation:</strong> Evaluation ratings, remarks, and recommendations directly impact the student's internship progression and must be submitted with professional diligence and integrity.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5: Institutional Scope Boundaries */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Layers size={20} />
                </div>
                <h2 className="text-xl font-bold">5. Institutional Scope and Workflow Boundaries</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                The Respective Cell operates as an integral component of the broader university internship process with clear divisional responsibilities:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <h3 className="font-semibold text-sm text-slate-900">Respective Cell Responsibility</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Receiving assigned students, configuring training details, conducting departmental training, tracking attendance, submitting evaluation feedback, and concluding the training phase.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <h3 className="font-semibold text-sm text-slate-900">Internship Cell (TEC) Responsibility</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Initial student allocation to cells, corporate internship placement, company joining verification, NOC generation, and final official internship completion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Prohibited Use & System Integrity */}
          <Card className="border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-xl font-bold">6. System Integrity and Prohibited Activities</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Users of the portal must not engage in any of the following activities:
              </p>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Attempting to bypass authentication or access records belonging to other departments.</li>
                <li>Entering fraudulent, falsified, or misleading student attendance or evaluation data.</li>
                <li>Interfering with portal operation, infrastructure, or network services.</li>
                <li>Failing to report known discrepancies or unauthorized account access to the Internship Cell.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 7: Administrative Support */}
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <Mail size={18} />
                </div>
                <h2 className="text-lg font-bold">7. Administrative Assistance</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                For administrative assistance, password resets, student assignment inquiries, or operational guidance, contact the central Internship Cell:
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
            <Link to="/privacy-policy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-slate-900 font-bold">
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

export default TermsPage;
