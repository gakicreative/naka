import React from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useStore } from '../store';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const notifications = useStore((s) => s.notifications) || [];
  const markNotificationAsRead = useStore((s) => s.markNotificationAsRead);
  const clearNotifications = useStore((s) => s.clearNotifications);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-16 right-4 w-80 sm:w-96 bg-surface border border-outline-variant/30 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 bg-surface-variant/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-semibold text-on-surface">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearNotifications()}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
                    title="Limpar todas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-on-surface-variant opacity-50" />
                  </div>
                  <p className="text-on-surface font-medium">Nenhuma notificação</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Você está em dia com todas as suas tarefas e atualizações.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 transition-colors hover:bg-surface-variant/50 relative group",
                        !notification.read ? "bg-primary/5" : ""
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                      )}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <h4 className={cn(
                            "text-sm font-medium mb-1",
                            !notification.read ? "text-on-surface" : "text-on-surface-variant"
                          )}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-[10px] text-on-surface-variant/70 mt-2 block">
                            {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 h-fit text-primary hover:bg-primary/10 rounded-full transition-all"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
