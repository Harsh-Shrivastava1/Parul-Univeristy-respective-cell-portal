import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Star, User, ClipboardList, CheckCircle } from 'lucide-react';
import studentService from '@/services/studentService';
import applicationService from '@/services/applicationService';
import trainingService from '@/services/trainingService';
import evaluationService from '@/services/evaluationService';
import { useAuthStore } from '@/store/authStore';
import type { Student, Application, Training, Evaluation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  technicalSkills: z.coerce.number().min(1).max(10),
  communication: z.coerce.number().min(1).max(10),
  punctuality: z.coerce.number().min(1).max(10),
  overallPerformance: z.coerce.number().min(1).max(10),
  remarks: z.string().min(5, 'Remarks are required (min 5 characters)'),
});

type FormData = z.infer<typeof schema>;

const EvaluationPage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const session = useAuthStore(state => state.session);
  const [success, setSuccess] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [existingEvaluation, setExistingEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      technicalSkills: 8,
      communication: 8,
      punctuality: 8,
      overallPerformance: 8,
      remarks: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const stud = await studentService.getStudentById(studentId);
        const apps = await applicationService.getApplicationsByCell();
        const app = apps.find(a => a.studentId === studentId) || null;
        
        setStudent(stud);
        setApplication(app);

        if (app) {
          const tr = await trainingService.getTrainingByApplicationId(app.applicationId);
          setTraining(tr);

          if (tr) {
            const ev = await evaluationService.getEvaluationByStudent(studentId);
            setExistingEvaluation(ev);
          }
        }
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
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student || !application || !training) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Student or active training not found.</p>
        <Button onClick={() => navigate('/students')}>Back to Students</Button>
      </div>
    );
  }

  if (existingEvaluation) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${studentId}`)} className="text-slate-500 hover:text-slate-900 rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">View Evaluation</h1>
            <p className="text-sm text-slate-500 mt-1">Evaluation has already been submitted for {student.name}.</p>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200">
           <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
             <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Star size={18} className="text-amber-500" />
               Performance Evaluation
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Technical Skills</p>
                  <p className="text-2xl font-bold text-slate-900">{existingEvaluation.technicalSkills}<span className="text-sm text-slate-400 font-medium">/10</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Communication</p>
                  <p className="text-2xl font-bold text-slate-900">{existingEvaluation.communication}<span className="text-sm text-slate-400 font-medium">/10</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Punctuality</p>
                  <p className="text-2xl font-bold text-slate-900">{existingEvaluation.punctuality}<span className="text-sm text-slate-400 font-medium">/10</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Overall Performance</p>
                  <p className="text-2xl font-bold text-slate-900">{existingEvaluation.overallPerformance}<span className="text-sm text-slate-400 font-medium">/10</span></p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Remarks</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[100px] whitespace-pre-wrap">{existingEvaluation.remarks}</p>
              </div>
           </CardContent>
         </Card>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    // 1. Submit Evaluation
    await evaluationService.submitEvaluation({
      applicationId: application.applicationId,
      studentId: student.studentId,
      trainingId: training.trainingId,
      ...data
    });

    // 2. Complete Training (sends email)
    await trainingService.completeTraining(training.trainingId);

    // 3. Update Application Status
    await applicationService.updateApplicationStatus(application.applicationId, 'TRAINING_COMPLETED');
    
    setSuccess(true);
    setTimeout(() => navigate(`/students/${studentId}`), 2500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Training Completed & Evaluated!</h2>
        <p className="text-slate-500 text-sm">Emails have been sent to TEC and Admin. Redirecting to profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${studentId}`)} className="text-slate-500 hover:text-slate-900 rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submit Evaluation</h1>
          <p className="text-sm text-slate-500 mt-1">Evaluate {student.name}'s performance and mark training as completed.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <User size={24} className="text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900">{student.name}</p>
            <p className="text-sm text-slate-500">{student.enrollmentNumber} · {student.assignedCompany}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-500" />
              Performance Metrics (1-10)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-slate-600">Technical Skills</Label>
                <Input type="number" min="1" max="10" {...register('technicalSkills')} />
                {errors.technicalSkills && <p className="text-xs font-medium text-red-500 mt-1">{errors.technicalSkills.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Communication</Label>
                <Input type="number" min="1" max="10" {...register('communication')} />
                {errors.communication && <p className="text-xs font-medium text-red-500 mt-1">{errors.communication.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Punctuality</Label>
                <Input type="number" min="1" max="10" {...register('punctuality')} />
                {errors.punctuality && <p className="text-xs font-medium text-red-500 mt-1">{errors.punctuality.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-600">Overall Performance</Label>
                <Input type="number" min="1" max="10" {...register('overallPerformance')} />
                {errors.overallPerformance && <p className="text-xs font-medium text-red-500 mt-1">{errors.overallPerformance.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-slate-600">Remarks / Feedback</Label>
                <Textarea 
                  {...register('remarks')} 
                  placeholder="Provide detailed feedback on the student's performance..." 
                  className="min-h-[120px]"
                />
                {errors.remarks && <p className="text-xs font-medium text-red-500 mt-1">{errors.remarks.message}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(`/students/${studentId}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm">
                {isSubmitting ? 'Submitting...' : 'Submit Evaluation & Complete Training'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EvaluationPage;
