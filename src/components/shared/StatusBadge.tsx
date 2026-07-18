import React from 'react';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'badge-pending' },
  SHORTLISTED: { label: 'Shortlisted', className: 'badge-shortlisted' },
  ASSIGNED: { label: 'Assigned', className: 'badge-assigned' },
  TRAINING_ACTIVE: { label: 'Training Active', className: 'badge-active' },
  TRAINING_COMPLETED: { label: 'Training Completed', className: 'badge-completed' },
  FINAL_CONFIRMED: { label: 'Final Confirmed', className: 'badge-confirmed' },
  REJECTED: { label: 'Rejected', className: 'badge-rejected' },
  ACTIVE: { label: 'Active', className: 'badge-active' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
  EXTENDED: { label: 'Extended', className: 'badge-shortlisted' },
  PRESENT: { label: 'Present', className: 'badge-active' },
  ABSENT: { label: 'Absent', className: 'badge-rejected' },
  LATE: { label: 'Late', className: 'badge-pending' },
  HOLIDAY: { label: 'Holiday', className: 'badge-assigned' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: 'badge-pending' };
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
