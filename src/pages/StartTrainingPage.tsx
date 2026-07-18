import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, GraduationCap, CalendarDays, MapPin, Clock, User, Building2, BookOpen } from 'lucide-react';
import studentService from '@/services/studentService';
import applicationService from '@/services/applicationService';
import trainingService from '@/services/trainingService';
import { useAuthStore } from '@/store/authStore';
import type { Student, Application } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  joiningDate: z.string().min(1, 'Joining date is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  mentorName: z.string().min(2, 'Mentor name is required'),
  companySupervisor: z.string().min(2, 'Company supervisor is required'),
  trainingModule: z.string().min(2, 'Training module is required'),
  reportingTime: z.string().min(1, 'Reporting time is required'),
  reportingLocation: z.string().min(3, 'Location is required'),
});

type FormData = z.infer<typeof schema>;

const StartTrainingPage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const session = useAuthStore(state => state.session);
  const [success, setSuccess] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      joiningDate: new Date().toISOString().split('T')[0],
      duration: 30,
      mentorName: '',
      companySupervisor: '',
      trainingModule: '',
      reportingTime: '09:00',
      reportingLocation: '',
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

  if (!student || !application) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Student not found or not eligible.</p>
        <Button onClick={() => navigate('/students')}>Back to Students</Button>
      </div>
    );
  }

  if (application.status !== 'ASSIGNED') {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Training can only be assigned for students with ASSIGNED status.</p>
        <Button onClick={() => navigate(`/students/${studentId}`)}>Back to Profile</Button>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    await trainingService.startTraining({
      applicationId: application.applicationId,
      studentId: student.studentId,
      assignedCellId: session?.cellId as any || 'cse_cell',
      mentorName: data.mentorName,
      companySupervisor: data.companySupervisor,
      trainingModule: data.trainingModule,
      joiningDate: data.joiningDate,
      reportingTime: data.reportingTime,
      reportingLocation: data.reportingLocation,
      duration: data.duration,
    });
    
    await applicationService.updateApplicationStatus(application.applicationId, 'TRAINING_ACTIVE');
    
    setSuccess(true);
    setTimeout(() => navigate(`/students/${studentId}`), 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <GraduationCap size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Training Assigned!</h2>
        <p className="text-slate-500 text-sm">Notification and email sent to the student. Redirecting to profile...</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Assign Training Details</h1>
          <p className="text-sm text-slate-500 mt-1">Configure schedule and assign a mentor for {student.name}.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              <GraduationCap size={24} className="text-blue-600" />
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
            <CardTitle className="text-lg">Training Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <User size={14} /> Assigned Mentor
                </Label>
                <Input {...register('mentorName')} placeholder="e.g. Prof. Rajesh Kumar" />
                {errors.mentorName && <p className="text-xs font-medium text-red-500 mt-1">{errors.mentorName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <Building2 size={14} /> Company Supervisor
                </Label>
                <Input {...register('companySupervisor')} placeholder="e.g. Mr. Anil Mehta" />
                {errors.companySupervisor && <p className="text-xs font-medium text-red-500 mt-1">{errors.companySupervisor.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <BookOpen size={14} /> Training Module
                </Label>
                <Input {...register('trainingModule')} placeholder="e.g. Full Stack Web Development using MERN" />
                {errors.trainingModule && <p className="text-xs font-medium text-red-500 mt-1">{errors.trainingModule.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays size={14} /> Joining Date
                </Label>
                <Input type="date" {...register('joiningDate')} />
                {errors.joiningDate && <p className="text-xs font-medium text-red-500 mt-1">{errors.joiningDate.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays size={14} /> Duration (Days)
                </Label>
                <Input type="number" {...register('duration')} />
                {errors.duration && <p className="text-xs font-medium text-red-500 mt-1">{errors.duration.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <Clock size={14} /> Reporting Time
                </Label>
                <Input type="time" {...register('reportingTime')} />
                {errors.reportingTime && <p className="text-xs font-medium text-red-500 mt-1">{errors.reportingTime.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-slate-600">
                  <MapPin size={14} /> Reporting Location
                </Label>
                <Input {...register('reportingLocation')} placeholder="e.g. Main Office, Floor 3" />
                {errors.reportingLocation && <p className="text-xs font-medium text-red-500 mt-1">{errors.reportingLocation.message}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(`/students/${studentId}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? 'Starting...' : 'Start Training & Notify'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default StartTrainingPage;
