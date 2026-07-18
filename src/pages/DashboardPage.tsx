import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, CheckCircle, ClipboardList,
  ArrowRight, Activity, Bell, Calendar
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import notificationService from '@/services/notificationService';
import applicationService from '@/services/applicationService';
import studentService from '@/services/studentService';
import trainingService from '@/services/trainingService';
import evaluationService from '@/services/evaluationService';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Notification, Application, Student, Training, Evaluation } from '@/types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const session = useAuthStore(state => state.session);

  const [stats, setStats] = useState({
    totalAssigned: 0,
    activeTraining: 0,
    pendingEvaluations: 0,
    completed: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ app: Application; student: Student | undefined }[]>([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState<{ training: Training; student: Student | undefined }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notifs, apps, students, trainings, evaluations] = await Promise.all([
          notificationService.getNotificationsByCell(),
          applicationService.getApplicationsByCell(),
          studentService.getStudentsByCell(),
          trainingService.getTrainingsByCell(),
          evaluationService.getEvaluationsByCell()
        ]);

        const totalAssigned = apps.filter(a => a.status === 'ASSIGNED').length;
        const activeTraining = trainings.filter(t => t.status === 'ACTIVE').length;
        
        // Find completed trainings that do not have an evaluation yet
        const completedTrainings = trainings.filter(t => t.status === 'COMPLETED');
        const pendingEvaluations = completedTrainings.filter(t => 
          !evaluations.find(e => e.trainingId === t.trainingId)
        ).length;

        const completed = apps.filter(a => a.status === 'TRAINING_COMPLETED').length;

        setStats({
          totalAssigned,
          activeTraining,
          pendingEvaluations,
          completed
        });

        // Set recent activity (last 5 assigned students)
        const recent = apps
          .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
          .slice(0, 5)
          .map(app => ({
            app,
            student: students.find(s => s.studentId === app.studentId)
          }));
        setRecentActivity(recent);

        // Upcoming Trainings
        const upcoming = trainings
          .filter(t => t.status === 'ASSIGNED' || t.status === 'ACTIVE')
          .sort((a, b) => new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime())
          .slice(0, 5)
          .map(training => ({
            training,
            student: students.find(s => s.studentId === training.studentId)
          }));
        setUpcomingTrainings(upcoming);

        setNotifications(notifs.filter(n => !n.isRead).slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {session?.coordinatorName?.split(' ')[0] || 'Coordinator'}
          </h1>
          <p className="text-slate-500">
            Here's what's happening in {session?.cellName} today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/students')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
            <Users size={16} /> View All Students
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={stats.totalAssigned}
          icon={<Users size={20} />}
          color="blue"
          change="+2 this week"
          positive={true}
        />
        <StatCard
          title="Training In Progress"
          value={stats.activeTraining}
          icon={<GraduationCap size={20} />}
          color="emerald"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats.pendingEvaluations}
          icon={<ClipboardList size={20} />}
          color="amber"
        />
        <StatCard
          title="Completed Trainings"
          value={stats.completed}
          icon={<CheckCircle size={20} />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 h-8 text-xs font-medium" onClick={() => navigate('/students')}>
              View All <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No recent activity.</div>
              ) : (
                recentActivity.map((item, i) => (
                  <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/students/${item.student?.studentId}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {item.student?.avatar ? (
                          <img src={item.student.avatar} alt={item.student.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-blue-700 font-bold text-sm">{item.student?.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{item.student?.name || 'Unknown Student'}</p>
                        <p className="text-xs text-slate-500">{item.student?.department || 'Unknown Dept'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                      <StatusBadge status={item.app.status} />
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-700">{formatDate(item.app.assignedDate)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications and Upcoming Training Schedule */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-semibold text-slate-800">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No new notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.notificationId} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-medium">{formatDate(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {notifications.length > 0 && (
                  <div className="p-3 bg-slate-50 text-center">
                    <Button variant="link" size="sm" className="text-blue-600 h-auto p-0 text-xs font-medium" onClick={() => navigate('/notifications')}>
                      View all notifications
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingTrainings.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No upcoming trainings.</div>
                ) : (
                  upcomingTrainings.map((t, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-semibold text-slate-800">{t.student?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.training.trainingModule}</p>
                      <p className="text-xs font-medium text-emerald-600 mt-1.5">
                        Starts: {formatDate(t.training.joiningDate)} at {t.training.reportingTime}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
