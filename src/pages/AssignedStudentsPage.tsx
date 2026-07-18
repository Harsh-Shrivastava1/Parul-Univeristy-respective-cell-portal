import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Eye, GraduationCap, Building2 } from 'lucide-react';
import studentService from '@/services/studentService';
import applicationService from '@/services/applicationService';
import trainingService from '@/services/trainingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import type { Student, Application, Training } from '@/types';

interface StudentRow {
  student: Student;
  application: Application;
  training?: Training;
}

const AssignedStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentRow[]>([]);
  const [filteredData, setFilteredData] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [students, applications, trainings] = await Promise.all([
          studentService.getStudentsByCell(),
          applicationService.getApplicationsByCell(),
          trainingService.getTrainingsByCell()
        ]);

        const rows = applications.map(app => ({
          application: app,
          student: students.find(s => s.studentId === app.studentId) as Student,
          training: trainings.find(t => t.applicationId === app.applicationId)
        })).filter(row => row.student);

        setData(rows);
        setFilteredData(rows);
      } catch (err) {
        console.error('Failed to fetch assigned students', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = data;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(row => 
        row.student.name.toLowerCase().includes(q) ||
        row.student.enrollmentNumber.toLowerCase().includes(q) ||
        row.application.status.toLowerCase().includes(q) ||
        row.student.assignedCompany.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(row => row.application.status === statusFilter);
    }
    setFilteredData(result);
  }, [searchTerm, statusFilter, data]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading assigned students...</p>
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Assigned Students
          </h1>
          <p className="text-slate-500 mt-1">Manage students assigned to your respective cell.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search by name, enrollment, company..." 
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <SelectValue placeholder="Filter by Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="TRAINING_ACTIVE">Training Active</SelectItem>
              <SelectItem value="TRAINING_COMPLETED">Training Completed</SelectItem>
              <SelectItem value="RETURNED_TO_TEC">Returned to TEC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No students found</h3>
            <p className="text-slate-500 mt-1">Adjust your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Enrollment & Dept</th>
                  <th className="px-6 py-4 font-semibold">Company & Mentor</th>
                  <th className="px-6 py-4 font-semibold">Training Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, idx) => (
                  <motion.tr 
                    key={row.application.applicationId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {row.student.avatar ? (
                            <img src={row.student.avatar} alt={row.student.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-700 font-bold text-sm">
                              {row.student.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{row.student.name}</p>
                          <p className="text-xs text-slate-500">{row.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{row.student.enrollmentNumber}</p>
                      <p className="text-xs text-slate-500">{row.student.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{row.student.assignedCompany}</span>
                        </div>
                        {row.training?.mentorName ? (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs text-slate-600">{row.training.mentorName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Pending Assignment</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.application.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-medium"
                        onClick={() => navigate(`/students/${row.student.studentId}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AssignedStudentsPage;
