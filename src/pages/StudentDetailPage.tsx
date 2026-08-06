import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, GraduationCap,
  CheckCircle, CalendarCheck, User, Star, ClipboardList
} from 'lucide-react';
import studentService from '@/services/studentService';
import applicationService from '@/services/applicationService';
import trainingService from '@/services/trainingService';
import evaluationService from '@/services/evaluationService';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { Student, Application, Training, Evaluation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  // Reject (before join) / Terminate / Complete (after join) — text mandatory.
  const [actionOpen, setActionOpen] = useState<null | 'reject' | 'terminate' | 'complete'>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const runAction = async () => {
    if (!application || !actionOpen || actionReason.trim().length < 3) return;
    setActionBusy(true);
    setActionError(null);
    try {
      if (actionOpen === 'reject') {
        await applicationService.rejectStudent(application.applicationId, actionReason.trim());
        setApplication({ ...application, status: 'REJECTED' as Application['status'] });
      } else if (actionOpen === 'complete') {
        await applicationService.completeInternship(application.applicationId, actionReason.trim());
        setApplication({ ...application, status: 'INTERNSHIP_COMPLETED' as Application['status'] });
      } else {
        await applicationService.terminateStudent(application.applicationId, actionReason.trim());
        setApplication({ ...application, status: 'TERMINATED' as Application['status'] });
      }
      setActionOpen(null);
      setActionReason('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setActionBusy(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const stud = await studentService.getStudentById(studentId);
        
        // Find the application for this student in the current cell
        const apps = await applicationService.getApplicationsByCell();
        const app = apps.find(a => a.studentId === studentId) || null;
        
        if (app) {
          setApplication(app);
          const tr = await trainingService.getTrainingByApplicationId(app.applicationId);
          setTraining(tr);
          
          if (tr) {
            const ev = await evaluationService.getEvaluationByStudent(studentId);
            setEvaluation(ev);
          }
        }
        setStudent(stud);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-500 text-lg mb-4 font-medium">Student not found or not assigned to your cell.</p>
        <Button onClick={() => navigate('/students')} className="gap-2">
          <ArrowLeft size={16} /> Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/students')} className="text-slate-500 hover:text-slate-900 rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
            <p className="text-sm text-slate-500 font-mono mt-0.5">{student.enrollmentNumber}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <StatusBadge status={application.status} />
          
          {application.status === 'ASSIGNED' && (
            <Button onClick={() => navigate(`/students/${studentId}/start-training`)} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
              <GraduationCap size={16} /> Assign Mentor & Schedule
            </Button>
          )}
          
          {application.status === 'TRAINING_ACTIVE' && (
            <>
              <Button onClick={() => navigate(`/students/${studentId}/evaluate`)} className="gap-2 bg-amber-500 hover:bg-amber-600 shadow-sm text-white border-0">
                <ClipboardList size={16} /> Submit Evaluation
              </Button>
            </>
          )}

          {application.status === 'TRAINING_COMPLETED' && (
            <Button onClick={() => navigate(`/students/${studentId}/evaluate`)} variant="outline" className="gap-2 bg-white shadow-sm border-slate-200">
              <Star size={16} className="text-indigo-600" /> View Evaluation
            </Button>
          )}

          {/* Department reject — allowed any time BEFORE the student joins. */}
          {['ASSIGNED', 'TRAINING_ACTIVE', 'TRAINING_COMPLETED'].includes(String(application.status)) && (
            <Button
              variant="outline"
              onClick={() => setActionOpen('reject')}
              className="gap-2 bg-white shadow-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Reject Student
            </Button>
          )}
          {/* After JOIN: Complete (success path) or Terminate. */}
          {String(application.status) === 'JOINED' && (
            <>
              <Button
                onClick={() => setActionOpen('complete')}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-0"
              >
                Complete Internship
              </Button>
              <Button
                onClick={() => setActionOpen('terminate')}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm border-0"
              >
                Terminate Internship
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reason dialog for Reject / Terminate */}
      <Dialog open={!!actionOpen} onOpenChange={(o) => { if (!o) { setActionOpen(null); setActionReason(''); setActionError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionOpen === 'terminate' ? 'Terminate Internship' : actionOpen === 'complete' ? 'Complete Internship' : 'Reject Student'}
            </DialogTitle>
            <DialogDescription>
              {actionOpen === 'terminate'
                ? 'This permanently closes the internship. The student, TEC and this department are notified.'
                : actionOpen === 'complete'
                  ? 'Marks the internship as successfully completed. The student and TEC are notified. The certificate is issued physically by the Internship Cell office.'
                  : 'This closes the application (the student can still apply to other internships). The student and TEC are notified.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="action-reason">{actionOpen === 'complete' ? 'Remarks *' : 'Reason *'}</Label>
            <Textarea
              id="action-reason"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={actionOpen === 'complete' ? 'Performance summary, final feedback (required)…' : 'State the reason (required)…'}
              rows={3}
            />
            {actionError && <p className="text-xs text-red-600">{actionError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setActionOpen(null); setActionReason(''); }}>Cancel</Button>
            <Button
              onClick={runAction}
              disabled={actionBusy || actionReason.trim().length < 3}
              className={actionOpen === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              {actionBusy ? 'Please wait…' : actionOpen === 'terminate' ? 'Terminate' : actionOpen === 'complete' ? 'Complete Internship' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Student Profile */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <User size={18} className="text-blue-500" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-4xl shadow-sm border-4 border-white mb-3">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      student.name.charAt(0)
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{student.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{student.department}</p>
                  <p className="text-xs text-slate-400 mt-1">Semester {student.semester}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <Mail size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email Address</p>
                      <p className="text-sm font-medium text-slate-900">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <Phone size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone Number</p>
                      <p className="text-sm font-medium text-slate-900">{student.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Training & Evaluation Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* TEC assignment remark — what the Internship Cell noted when routing
              this student to the department. */}
          {application.assignmentRemark ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-sm border-blue-200 bg-blue-50/40">
                <CardContent className="p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1.5">
                    <ClipboardList size={14} /> Remark from Internship Cell (TEC)
                  </h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{application.assignmentRemark}</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-sm border-slate-200 h-full">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-500" />
                  Placement Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Company</h4>
                  <p className="text-lg font-semibold text-slate-900">{student.assignedCompany}</p>
                </div>
                
                {training ? (
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5"><User size={14} /> Mentor Name</h4>
                      <p className="text-sm font-semibold text-slate-900">{training.mentorName}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5"><GraduationCap size={14} /> Training Module</h4>
                      <p className="text-sm font-semibold text-slate-900">{training.trainingModule}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5"><MapPin size={14} /> Reporting Location</h4>
                      <p className="text-sm font-semibold text-slate-900">{training.reportingLocation}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5"><CalendarCheck size={14} /> Start Date</h4>
                      <p className="text-sm font-semibold text-slate-900">{formatDate(training.joiningDate)}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5"><CheckCircle size={14} /> Status</h4>
                      <p className="text-sm font-semibold text-emerald-600">{training.status}</p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 text-center py-6">
                    <GraduationCap className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 text-sm">Training details have not been assigned yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {evaluation && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <Card className="shadow-sm border-slate-200">
                 <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                   <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                     <Star size={18} className="text-amber-500" />
                     Performance Evaluation
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Technical Skills</p>
                        <p className="font-semibold text-slate-900">{evaluation.technicalSkills}/10</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Communication</p>
                        <p className="font-semibold text-slate-900">{evaluation.communication}/10</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Punctuality</p>
                        <p className="font-semibold text-slate-900">{evaluation.punctuality}/10</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Overall Performance</p>
                        <p className="font-semibold text-slate-900">{evaluation.overallPerformance}/10</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Remarks</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{evaluation.remarks}</p>
                    </div>
                 </CardContent>
               </Card>
             </motion.div>
          )}
        </div>
      </div>

      {/* Submitted application form — the details the student filled and sent to
          TEC, shown read-only for the coordinator's reference. */}
      {application.formData ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-500" />
                Submitted Application Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {(() => {
                const fd = application.formData as Record<string, any>;
                const val = (v: any) => (v === undefined || v === null || v === '' ? '—' : String(v));
                const rows: [string, any][] = [
                  ['Full Name', fd.fullName],
                  ['Enrollment Number', fd.enrollmentNumber],
                  ['Email', fd.email],
                  ['Contact', fd.contact],
                  ['Institute', fd.instituteName],
                  ['Department', fd.departmentName],
                  ['Position Applied', fd.position],
                  ['Semester', fd.semester],
                  ['CGPA', fd.cgpa],
                  ['Live Backlogs', fd.backlogs],
                  ['Attendance', fd.attendance != null && fd.attendance !== '' ? `${fd.attendance}%` : ''],
                  ['Date of Birth', fd.dateOfBirth],
                  ['Gender', fd.gender],
                  ["Father's Name", fd.fatherName],
                  ["Mother's Name", fd.motherName],
                  ['Present Address', fd.presentAddress],
                  ['Permanent Address', fd.permanentAddress],
                  ['Languages Known', fd.languagesKnown],
                ];
                const spi =
                  fd.spiScores && typeof fd.spiScores === 'object'
                    ? Object.entries(fd.spiScores as Record<string, unknown>).filter(([, v]) => v !== '' && v != null)
                    : [];
                return (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                      {rows.map(([label, v]) => (
                        <div key={label} className="min-w-0">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-sm font-medium text-slate-900 break-words">{val(v)}</p>
                        </div>
                      ))}
                    </div>
                    {spi.length ? (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">SPI (per semester)</p>
                        <div className="flex flex-wrap gap-2">
                          {spi.map(([sem, v]) => (
                            <span key={sem} className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-100 px-2 py-1 text-xs">
                              <span className="text-slate-500">{sem.toUpperCase()}</span>
                              <span className="font-semibold text-slate-900">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {fd.tasksCanPerform ? (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Tasks / Skills</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{val(fd.tasksCanPerform)}</p>
                      </div>
                    ) : null}
                    {fd.supportInformation ? (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Supporting Information</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{val(fd.supportInformation)}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  );
};

export default StudentDetailPage;
