import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'amber' | 'emerald' | 'blue' | 'violet' | 'rose' | 'sky';
  change?: string;
  positive?: boolean;
  delay?: number;
  subtitle?: string;
}

const colorMap = {
  amber: 'text-amber-600 bg-amber-100',
  emerald: 'text-emerald-600 bg-emerald-100',
  blue: 'text-blue-600 bg-blue-100',
  violet: 'text-violet-600 bg-violet-100',
  rose: 'text-rose-600 bg-rose-100',
  sky: 'text-sky-600 bg-sky-100',
};

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon, color = 'blue', change, positive, delay = 0, subtitle
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <Card className="hover:shadow-md hover:border-blue-200 transition-all duration-200 h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("p-3 rounded-xl", colorMap[color])}>
              {icon}
            </div>
            {change && (
              <span className={cn(
                "text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                positive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
              )}>
                {positive ? '↑' : '↓'} {change}
              </span>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
