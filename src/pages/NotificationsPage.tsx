import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import notificationService from '@/services/notificationService';
import { formatDateTime } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const typeLabels: Record<string, string> = {
  NEW_ASSIGNMENT: 'New Assignment',

  TRAINING_COMPLETION: 'Training',
  FINAL_CONFIRMATION: 'Confirmation',
  GENERAL: 'General',
};

const typeColors: Record<string, string> = {
  NEW_ASSIGNMENT: 'text-amber-600 bg-amber-100',

  TRAINING_COMPLETION: 'text-emerald-600 bg-emerald-100',
  FINAL_CONFIRMATION: 'text-violet-600 bg-violet-100',
  GENERAL: 'text-slate-600 bg-slate-100',
};

const NotificationsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const notifs = await notificationService.getNotificationsByCell();
        setAllNotifications(notifs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [refreshKey]);

  const notifications = useMemo(() => {
    return allNotifications.filter((n: any) => {
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (unreadOnly && (n.isRead || n.read)) return false;
      return true;
    });
  }, [allNotifications, filterType, unreadOnly]);

  const unreadCount = useMemo(() => allNotifications.filter((n: any) => !n.isRead && !n.read).length, [allNotifications]);

  const markRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setRefreshKey(k => k + 1);
  };

  const markAll = async () => {
    await notificationService.markAllAsRead();
    setRefreshKey(k => k + 1);
  };

  const deleteN = async (id: string) => {
    setRefreshKey(k => k + 1);
  };

  if (loading && allNotifications.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount} unread messages</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAll} className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
            <CheckCheck size={16} /> Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <Select value={filterType} onValueChange={(val) => setFilterType(val as NotificationType | 'all')}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(Object.keys(typeLabels)).map(t => (
                  <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label htmlFor="unread-only" className="text-sm font-medium text-slate-600 cursor-pointer">Unread only</Label>
          </div>

          {(filterType !== 'all' || unreadOnly) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterType('all'); setUnreadOnly(false); }} className="text-slate-500 hover:text-slate-900">
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="shadow-sm border-slate-200 border-dashed">
                <CardContent className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Bell size={28} className="text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">No notifications found</p>
                  <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : notifications.map((n: any, i) => (
            <motion.div
              key={n.notificationId || n._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`shadow-sm transition-all duration-200 ${!(n.isRead || n.read) ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <CardContent className="p-4 sm:p-5 flex gap-4">
                  <div className={`flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full ${!(n.isRead || n.read) ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-slate-200'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${typeColors[n.type] || typeColors['GENERAL']}`}>
                        {typeLabels[n.type] || n.type}
                      </span>
                      <p className={`text-sm font-bold ${!(n.isRead || n.read) ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                    </div>
                    <p className={`text-sm ${!(n.isRead || n.read) ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{n.message}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-2">{formatDateTime(n.createdAt || n.date)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1.5 flex-shrink-0 ml-4">
                    {!(n.isRead || n.read) && (
                      <Button variant="ghost" size="icon" onClick={() => markRead(n.notificationId || n._id)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Mark as read">
                        <CheckCheck size={16} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteN(n.notificationId || n._id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPage;
