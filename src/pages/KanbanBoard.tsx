import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { ChevronLeft, Plus, Archive, MoreHorizontal, ChevronDown, MessageSquare, Paperclip, Calendar, GripVertical, AlertCircle, X, Send, AlignLeft, MousePointerClick, Image as ImageIcon, Check, MessageSquareDashed, Type, Terminal, FolderHeart, Trash2, Edit2, CheckCircle2, Tag, EyeOff, RotateCcw, Users, Link2, Search, ListChecks, Layers } from 'lucide-react';
import { LabelTag } from '../components/LabelTag';
import { Link, useParams } from 'react-router-dom';
import { cn, compressImage } from '../lib/utils';
import { useStore } from '../store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { NewTaskModal } from '../components/modals/NewTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { useTranslation } from 'react-i18next';

const MOCK_USER = { uid: 'local-user', displayName: 'Yuri', photoURL: null };

const priorityConfig = {
  'Urgente': { color: 'text-[#ffb4ab]', bg: 'bg-[#ffb4ab]/10', border: 'border-[#ffb4ab]/20', icon: AlertCircle },
  'Alta': { color: 'text-[#ffb4ab]', bg: 'bg-[#ffb4ab]/10', border: 'border-[#ffb4ab]/20', icon: AlertCircle },
  'Média': { color: 'text-[#6cd3fc]', bg: 'bg-[#6cd3fc]/10', border: 'border-[#6cd3fc]/20', icon: null },
  'Baixa': { color: 'text-[#81c784]', bg: 'bg-[#81c784]/10', border: 'border-[#81c784]/20', icon: null },
};

type Priority = keyof typeof priorityConfig;

interface Assignee {
  name: string;
  avatar: string;
}

interface Task {
  id: string;
  title: string;
  priority: Priority;
  date: string;
  comments: number;
  attachments: number;
  assignees: Assignee[];
  status: string;
  project: string;
  projectId?: string;
  clientId?: string;
  tags?: string[];
  internalPriority?: string;
  completedAt?: string;
  designSpecs?: {
    creativeDirection?: string;
    sizes?: string;
    fileTypes?: string;
  };
  subTaskIds?: string[];
  checklist?: { id: string; text: string; done: boolean }[];
}

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  senderId?: string;
  time: string;
  text?: string;
  image?: string;
  isClient?: boolean;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  text: string;
  resolved: boolean;
  author: string;
}

interface ColumnData {
  title: string;
  role: string;
  color: string;
  tasks: Task[];
}

const mockUsers = {
  ana: { name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?u=ana' },
  carlos: { name: 'Carlos Santos', avatar: 'https://i.pravatar.cc/150?u=carlos' },
  marcos: { name: 'Marcos Lima', avatar: 'https://i.pravatar.cc/150?u=marcos' },
  sofia: { name: 'Sofia Costa', avatar: 'https://i.pravatar.cc/150?u=sofia' },
};

const columnDefs = {
  todo: {
    title: 'A Fazer',
    role: 'Backlog e planejamento',
    color: 'bg-[#8d909a]',
  },
  'in-progress': {
    title: 'Em Progresso',
    role: 'Execução ativa',
    color: 'bg-[#6cd3fc]',
  },
  review: {
    title: 'Revisão',
    role: 'Aguardando aprovação',
    color: 'bg-[#ffb4ab]',
  },
  done: {
    title: 'Concluído',
    role: 'Finalizado',
    color: 'bg-[#81c784]',
  }
};

function VisualFeedbackModal({ taskId, imageUrl, onClose }: { taskId: string; imageUrl: string; onClose: () => void }) {
  const { t } = useTranslation();
  const storePins = useStore((s) => s.pins);
  const addPin    = useStore((s) => s.addPin);
  const updatePin = useStore((s) => s.updatePin);
  const deletePinFromStore = useStore((s) => s.deletePin);

  // Filter only pins for this task + image
  const pins = storePins.filter((p) => p.taskId === taskId && p.imageUrl === imageUrl);

  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [draftText, setDraftText] = useState('');
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('.pin-marker')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDraftPin({ x, y });
    setDraftText('');
    setActivePinId(null);
  };

  const saveDraftPin = () => {
    if (!draftPin || !draftText.trim()) return;
    addPin({
      taskId,
      imageUrl,
      x: draftPin.x,
      y: draftPin.y,
      text: draftText,
      resolved: false,
      author: MOCK_USER.displayName,
    });
    setDraftPin(null);
    setDraftText('');
  };

  const toggleResolve = (id: string, currentResolved: boolean) => {
    updatePin(id, { resolved: !currentResolved });
  };

  const deletePin = (id: string) => {
    if (!window.confirm(t('kanban.confirmDeleteComment'))) return;
    deletePinFromStore(id);
    if (activePinId === id) setActivePinId(null);
  };

  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editPinText, setEditPinText] = useState('');

  const startEditingPin = (pin: Pin) => {
    setEditingPinId(pin.id);
    setEditPinText(pin.text);
  };

  const saveEditPin = (id: string) => {
    if (!editPinText.trim()) return;
    updatePin(id, { text: editPinText });
    setEditingPinId(null);
    setEditPinText('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#0a0a0a] animate-in fade-in duration-200">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-[#131313] border-b border-[#2a2a2a] flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-[#2a2a2a] rounded-full text-[#8d909a] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-headline font-bold text-[#e5e2e1]">Feedback Visual</h2>
          <div className="px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#8d909a] flex items-center gap-2">
            <MousePointerClick className="w-3.5 h-3.5" />
            Clique na imagem para adicionar um comentário
          </div>
        </div>
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-[#e5e2e1] text-sm font-medium transition-colors">
          Concluir
        </button>
      </div>

      {/* Main Content */}
      <div className="flex w-full h-full pt-16">
        {/* Image Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center p-8">
          <div 
            ref={imageContainerRef}
            className="relative max-w-full max-h-full shadow-2xl cursor-crosshair"
            onClick={handleImageClick}
          >
            <img 
              src={imageUrl} 
              alt="Feedback target" 
              className="max-w-full max-h-full object-contain rounded-lg border border-[#2a2a2a]"
              referrerPolicy="no-referrer"
            />
            
            {/* Render Pins */}
            {pins.map((pin, index) => (
              <div 
                key={pin.id}
                className={cn(
                  "pin-marker absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer transition-transform hover:scale-110",
                  pin.resolved ? "bg-[#81c784] text-[#0a0a0a]" : "bg-[#ffb4ab] text-[#0a0a0a]",
                  activePinId === pin.id && "ring-4 ring-white/20"
                )}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePinId(pin.id);
                  setDraftPin(null);
                }}
              >
                {index + 1}
              </div>
            ))}

            {/* Draft Pin */}
            {draftPin && (
              <div 
                className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-[#b7c4ff] text-[#002682] flex items-center justify-center text-sm font-bold shadow-lg animate-bounce"
                style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}
              >
                +
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-[#131313] border-l border-[#2a2a2a] flex flex-col h-full">
          <div className="p-5 border-b border-[#2a2a2a]">
            <h3 className="font-headline font-semibold text-[#e5e2e1] flex items-center gap-2">
              <MessageSquareDashed className="w-5 h-5 text-[#8d909a]" />
              Comentários ({pins.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {draftPin && (
              <div className="bg-[#1c1c1c] border border-[#b7c4ff]/50 rounded-xl p-4 shadow-lg animate-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#b7c4ff] text-[#002682] flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                  <span className="text-sm font-medium text-[#e5e2e1]">Novo Comentário</span>
                </div>
                <textarea
                  autoFocus
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Descreva a alteração necessária..."
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 resize-none h-24 mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setDraftPin(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#8d909a] hover:bg-[#2a2a2a] transition-colors">
                    Cancelar
                  </button>
                  <button onClick={saveDraftPin} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#b7c4ff] text-[#002682] hover:bg-[#b7c4ff]/90 transition-colors">
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {pins.map((pin, index) => (
              <div 
                key={pin.id}
                className={cn(
                  "bg-[#1c1c1c] border rounded-xl p-4 transition-colors cursor-pointer",
                  activePinId === pin.id ? "border-[#b7c4ff]/50" : "border-[#2a2a2a] hover:border-[#333]",
                  pin.resolved && "opacity-60"
                )}
                onClick={() => setActivePinId(pin.id)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      pin.resolved ? "bg-[#81c784] text-[#0a0a0a]" : "bg-[#ffb4ab] text-[#0a0a0a]"
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-[#e5e2e1]">{pin.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {pin.author === MOCK_USER.displayName && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEditingPin(pin); }}
                          className="p-1.5 rounded-md transition-colors bg-[#2a2a2a] text-[#8d909a] hover:text-[#e5e2e1]"
                          title="Editar comentário"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePin(pin.id); }}
                          className="p-1.5 rounded-md transition-colors bg-[#2a2a2a] text-[#8d909a] hover:text-[#ffb4ab]"
                          title="Excluir comentário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleResolve(pin.id, pin.resolved); }}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        pin.resolved ? "bg-[#81c784]/20 text-[#81c784]" : "bg-[#2a2a2a] text-[#8d909a] hover:text-[#e5e2e1]"
                      )}
                      title={pin.resolved ? "Reabrir" : "Marcar como resolvido"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {editingPinId === pin.id ? (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      autoFocus
                      value={editPinText}
                      onChange={(e) => setEditPinText(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 resize-none h-24 mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingPinId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#8d909a] hover:bg-[#2a2a2a] transition-colors">
                        Cancelar
                      </button>
                      <button onClick={() => saveEditPin(pin.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#b7c4ff] text-[#002682] hover:bg-[#b7c4ff]/90 transition-colors">
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={cn("text-sm", pin.resolved ? "text-[#8d909a] line-through" : "text-[#e5e2e1]")}>
                    {pin.text}
                  </p>
                )}
              </div>
            ))}

            {pins.length === 0 && !draftPin && (
              <div className="text-center py-10 text-[#8d909a] text-sm">
                {t('kanban.noComments')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tag color palette (cycling by index)
const TAG_COLORS = [
  'bg-[#b7c4ff]/15 text-[#b7c4ff]',
  'bg-[#81c784]/15 text-[#81c784]',
  'bg-[#ffb4ab]/15 text-[#ffb4ab]',
  'bg-[#6cd3fc]/15 text-[#6cd3fc]',
  'bg-[#f9a825]/15 text-[#f9a825]',
  'bg-[#ce93d8]/15 text-[#ce93d8]',
];

function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function TaskLabelList({ labelIds }: { labelIds: string[] }) {
  const storeLabels = useStore((s) => s.labels);
  const found = labelIds.map(id => storeLabels.find(l => l.id === id)).filter(Boolean) as import('../store').TaskLabel[];
  if (found.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {found.map(lbl => <LabelTag key={lbl.id} label={lbl} size="sm" />)}
    </div>
  );
}

function TaskCard({
  task,
  onClick,
  onCommentClick,
  onComplete,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver
}: {
  key?: string | number;
  task: Task;
  onClick: () => void;
  onCommentClick: (e: React.MouseEvent) => void;
  onComplete?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}) {
  const { t } = useTranslation();
  const { deleteTask, updateTask } = useStore();
  const config = priorityConfig[task.priority] || priorityConfig['Média'];
  const Icon = config.icon;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(t('kanban.confirmDeleteTask'))) return;
    setIsDeleting(true);
    deleteTask(task.id);
    toast.success(t('kanban.taskDeleted'));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      id={`task-${task.id}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "task-card bg-[#1c1c1c] rounded-xl p-4 border transition-all group shadow-sm hover:shadow-md",
        isDragOver ? "border-[#b7c4ff] border-2 border-dashed opacity-80 scale-[1.02]" : "border-[#2a2a2a] hover:border-[#b7c4ff]/50",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border", config.bg, config.color, config.border)}>
          {Icon && <Icon className="w-3 h-3" />}
          {task.priority}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onComplete?.();
            }}
            className="p-1.5 text-[#8d909a] hover:text-[#81c784] hover:bg-[#81c784]/10 rounded-md transition-colors"
            title={t('kanban.completeTask')}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-[#8d909a] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-md transition-colors"
            title={t('kanban.deleteTask')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateTask(task.id, { status: 'archived' });
              toast.success(t('kanban.taskArchived'));
            }}
            className="p-1.5 text-[#8d909a] hover:text-[#b7c4ff] hover:bg-[#b7c4ff]/10 rounded-md transition-colors"
            title={t('kanban.archiveTask')}
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h4 className="text-sm font-medium text-[#e5e2e1] mb-2 leading-snug group-hover:text-[#b7c4ff] transition-colors">
        {task.title}
      </h4>

      {/* Labels */}
      {task.tags && task.tags.length > 0 && (
        <TaskLabelList labelIds={task.tags} />
      )}
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2 text-[#8d909a]">
          <div className="flex items-center gap-1.5 text-xs bg-[#2a2a2a]/50 px-2 py-1.5 rounded-md" title="Due Date">
            <Calendar className={cn("w-3.5 h-3.5", task.date === 'Hoje' ? 'text-[#ffb4ab]' : '')} />
            <span className={cn("font-medium", task.date === 'Hoje' ? 'text-[#ffb4ab]' : 'text-[#e5e2e1]')}>{task.date}</span>
          </div>
          
          <div 
            className="flex items-center gap-1.5 text-xs hover:text-[#b7c4ff] hover:bg-[#b7c4ff]/10 px-2 py-1.5 rounded-md cursor-pointer transition-colors" 
            title="Comments"
            onClick={onCommentClick}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-medium">{task.comments}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md" title="Attachments">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="font-medium">{task.attachments}</span>
          </div>
        </div>
        
        <div className="flex items-center -space-x-2">
          {task.assignees.map((assignee, i) => (
            <img 
              key={i} 
              src={assignee.avatar} 
              alt={assignee.name}
              title={assignee.name}
              className="w-7 h-7 rounded-full border-2 border-[#1c1c1c] object-cover z-10 hover:z-20 transition-transform hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = true,
  forceOpen,
  children,
  action
}: {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { if (forceOpen) setIsOpen(true); }, [forceOpen]);

  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between group cursor-pointer hover:bg-[#2a2a2a]/30 p-2 -mx-2 rounded-lg transition-colors" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#8d909a]" />
          <h3 className="text-base font-semibold text-[#e5e2e1]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
          <button className="text-[#8d909a] hover:text-[#e5e2e1] transition-colors p-1 rounded hover:bg-[#2a2a2a]">
            <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")} />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="pl-8 animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// Seed messages for testing visual feedback
// task-001: two images — one already has pins in the store, one is blank
const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  'task-feedback-test': [
    {
      id: 'msg-seed-001',
      sender: 'Y',
      senderName: 'Yuri',
      senderId: 'local-user',
      time: '09:15',
      text: 'Primeira versão do layout — já deixei alguns comentários de feedback visual aqui 👇',
      image: 'https://picsum.photos/seed/feedback/800/500',
    },
    {
      id: 'msg-seed-002',
      sender: 'Y',
      senderName: 'Yuri',
      senderId: 'local-user',
      time: '09:22',
      text: 'Essa é a versão mobile — ainda sem nenhum feedback, pode anotar direto:',
      image: 'https://picsum.photos/seed/mobile/800/500',
    },
  ],
};

function DesignSpecField({ label, value, placeholder, onSave }: {
  label: string; value: string; placeholder: string; onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[#8d909a] uppercase tracking-wider">{label}</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Enter') handleBlur();
            if (e.key === 'Escape') { setEditing(false); setDraft(value); }
          }}
          className="bg-[#0a0a0a] border border-[#b7c4ff]/50 rounded-md px-2 py-1 text-xs text-[#e5e2e1] focus:outline-none w-full"
        />
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="text-xs text-left text-[#e5e2e1] hover:text-[#b7c4ff] transition-colors truncate"
        >
          {value || <span className="text-[#555] italic">{placeholder}</span>}
        </button>
      )}
    </div>
  );
}

function TaskModal({ task, onClose, onOpenFeedback, focusChat, projectId }: { task: Task; onClose: () => void; onOpenFeedback: (url: string) => void; focusChat?: boolean; projectId?: string }) {
  const { t } = useTranslation();
  const { updateTask, projects, updateProject, addLabel, updateLabel, deleteLabel } = useStore();
  const storeLabels = useStore((s) => s.labels);
  const brandhubs = useStore((s) => s.brandhubs);
  const allTasks = useStore((s) => s.tasks);
  const project = projects.find(p => p.id === (task.projectId || projectId));
  const brandHub = brandhubs.find(h =>
    (task.clientId && h.clientId === task.clientId) ||
    (task.projectId && h.projectId === task.projectId) ||
    ((task.projectId || projectId) && h.projectId === (task.projectId || projectId))
  ) ?? null;

  // Assignees local state (so picker reflects changes immediately)
  const [localAssignees, setLocalAssignees] = useState<Assignee[]>(task.assignees);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelColor, setEditLabelColor] = useState('');
  const [editLabelIcon, setEditLabelIcon] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#b7c4ff');
  const [newLabelIcon, setNewLabelIcon] = useState('solar:tag-linear');
  const [showSubTaskPicker, setShowSubTaskPicker] = useState(false);
  const [subTaskSearch, setSubTaskSearch] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activeStrip, setActiveStrip] = useState<'subtask' | 'checklist' | null>(null);
  type TaskTab = 'overview' | 'checklist' | 'assets' | 'chat';
  const [activeTab, setActiveTab] = useState<TaskTab>('overview');

  // Available members from project or fallback
  const availableMembers: string[] = project?.teamMembers?.map(m => m.name)
    ?? Object.values(mockUsers).map(u => u.name);

  const handleToggleAssignee = (name: string) => {
    const isAssigned = localAssignees.some(a => a.name === name);
    const updated = isAssigned
      ? localAssignees.filter(a => a.name !== name)
      : [...localAssignees, { name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a2a2a&color=e5e2e1` }];
    setLocalAssignees(updated);
    updateTask(task.id, { assignees: updated.map(a => a.name) });
  };

  const handleToggleSubTask = (linkedId: string) => {
    const current = task.subTaskIds || [];
    const updated = current.includes(linkedId)
      ? current.filter(id => id !== linkedId)
      : [...current, linkedId];
    updateTask(task.id, { subTaskIds: updated });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const current = task.checklist || [];
    updateTask(task.id, { checklist: [...current, { id: crypto.randomUUID(), text: newChecklistItem.trim(), done: false }] });
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (id: string) => {
    const updated = (task.checklist || []).map(i => i.id === id ? { ...i, done: !i.done } : i);
    updateTask(task.id, { checklist: updated });
  };

  const handleDeleteChecklistItem = (id: string) => {
    updateTask(task.id, { checklist: (task.checklist || []).filter(i => i.id !== id) });
  };

  // Tasks linkable as sub-tasks (same project/client, not self)
  const linkableTasks = allTasks.filter(t =>
    t.id !== task.id &&
    t.status !== 'archived' &&
    (t.projectId === (task.projectId || projectId) || t.clientId === task.clientId) &&
    (subTaskSearch === '' || t.title.toLowerCase().includes(subTaskSearch.toLowerCase()))
  );
  const taskTags = task.tags || [];
  const [newTagInput, setNewTagInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => SEED_MESSAGES[task.id] ?? []);
  const [newMessage, setNewMessage] = useState('');
  const chatInputRef = React.useRef<HTMLInputElement>(null);
  // Messages are session-local; seed data pre-loaded for task-001

  React.useEffect(() => {
    if (focusChat) {
      setActiveTab('chat');
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [focusChat]);

  const [attachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress] = useState(0);

  if (!task) return null;
  const config = priorityConfig[task.priority] || priorityConfig['Média'];
  const Icon = config.icon;

  const handleToggleTag = (tag: string) => {
    const current = task.tags || [];
    const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    updateTask(task.id, { tags: updated });
  };

  const handleAddNewTag = () => {
    const tag = newTagInput.trim();
    if (!tag) return;
    // Add to task
    const updatedTaskTags = [...(task.tags || []), tag];
    updateTask(task.id, { tags: updatedTaskTags });
    // Add to project pool if not already there
    const availableTags = project?.availableTags || [];
    if (project && !availableTags.includes(tag)) {
      updateProject(project.id, { availableTags: [...availableTags, tag] });
    }
    setNewTagInput('');
  };

  const handleCompleteTask = () => {
    updateTask(task.id, { status: 'archived', completedAt: new Date().toISOString() });
    toast.success(t('kanban.taskCompleted'));
    onClose();
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const newComment: ChatMessage = {
      id: crypto.randomUUID(),
      sender: MOCK_USER.displayName.charAt(0).toUpperCase(),
      senderName: MOCK_USER.displayName,
      senderId: MOCK_USER.uid,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newMessage,
    };
    setMessages((prev) => [...prev, newComment]);
    setNewMessage('');
  };

  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('kanban.onlyImages'));
      if (e.target) e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('kanban.imageTooLarge'));
      if (e.target) e.target.value = '';
      return;
    }
    setIsUploading(true);
    try {
      // Compress the image before creating the URL
      const imageUrl = await compressImage(file);
      const newMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: MOCK_USER.displayName.charAt(0).toUpperCase(),
        senderName: MOCK_USER.displayName,
        senderId: MOCK_USER.uid,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        image: imageUrl,
      };
      setMessages((prev) => [...prev, newMsg]);
      toast.success(t('kanban.imageUploaded'));
    } catch {
      toast.error(t('kanban.imageError'));
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    toast.info('Upload de anexos disponível após integração com backend.');
    if (e.target) e.target.value = '';
  };

  const deleteAttachment = (_id: string) => {
    toast.info('Gerenciamento de anexos disponível após integração com backend.');
  };

  const deleteComment = (id: string) => {
    if (!window.confirm(t('kanban.confirmDeleteComment'))) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const startEditingComment = (msg: ChatMessage) => {
    setEditingCommentId(msg.id);
    setEditCommentText(msg.text || '');
  };

  const saveEditComment = (id: string) => {
    if (!editCommentText.trim()) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: editCommentText } : m))
    );
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const TASK_TABS: { id: TaskTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Visão Geral', icon: Layers },
    { id: 'checklist', label: 'Checklist', icon: ListChecks },
    { id: 'assets', label: 'Ativos', icon: FolderHeart },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1c1c1c] w-full max-w-4xl h-[85vh] rounded-2xl border border-[#2a2a2a] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

        {/* ─── Gradient Header ─── */}
        {/* ─── Gradient Header ─── */}
        <div className="flex-shrink-0 rounded-t-2xl px-6 pt-5 pb-4" style={{ background: 'linear-gradient(to bottom left, #1a1a2e 0%, #0d0d0d 100%)' }}>
          {/* Row 1: title + close */}
          <div className="flex items-start gap-3 mb-4">
            <input
              type="text"
              defaultValue={task.title}
              onBlur={(e) => {
                if (e.target.value.trim() !== task.title) {
                  updateTask(task.id, { title: e.target.value.trim() });
                  toast.success(t('kanban.titleUpdated'));
                }
              }}
              className="flex-1 bg-transparent text-2xl font-headline font-bold text-white focus:outline-none border-b border-transparent focus:border-white/30 pb-1 transition-colors"
            />
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-colors shrink-0 mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Row 2: priority + date + tags + assignees + complete */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border shrink-0", config.bg, config.color, config.border)}>
              {Icon && <Icon className="w-3 h-3" />}
              {task.priority}
            </div>
            <span className="text-xs text-white/50 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              {task.date}
            </span>
            {taskTags.map(labelId => {
              const lbl = storeLabels.find(l => l.id === labelId);
              return lbl ? <LabelTag key={labelId} label={lbl} size="sm" onRemove={() => handleToggleTag(labelId)} /> : null;
            })}
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(v => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/40 border border-dashed border-white/20 hover:border-white/50 hover:text-white/70 transition-colors"
              >
                <Tag className="w-3 h-3" />
                <Plus className="w-2.5 h-2.5" />
              </button>
              {showLabelPicker && (
                <div className="absolute top-7 left-0 z-20 bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl p-3 w-72" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-[#8d909a] uppercase tracking-wider font-medium">Etiquetas</p>
                    <button onClick={() => setShowLabelPicker(false)} className="text-[#8d909a] hover:text-white transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Existing labels with toggle + edit + delete */}
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto mb-2">
                    {storeLabels.length === 0 && (
                      <p className="text-xs text-[#8d909a] text-center py-2">Nenhuma etiqueta ainda</p>
                    )}
                    {storeLabels.map(lbl => {
                      const active = taskTags.includes(lbl.id);
                      const isEditing = editingLabelId === lbl.id;
                      return (
                        <div key={lbl.id}>
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#242424]">
                              <input
                                type="color"
                                value={editLabelColor}
                                onChange={e => setEditLabelColor(e.target.value)}
                                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                              />
                              <input
                                autoFocus
                                value={editLabelName}
                                onChange={e => setEditLabelName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    updateLabel(lbl.id, { title: editLabelName, color: editLabelColor, iconName: editLabelIcon });
                                    setEditingLabelId(null);
                                  } else if (e.key === 'Escape') {
                                    setEditingLabelId(null);
                                  }
                                }}
                                className="flex-1 bg-transparent text-xs text-white outline-none min-w-0"
                                placeholder="Nome"
                              />
                              <button
                                onClick={() => {
                                  updateLabel(lbl.id, { title: editLabelName, color: editLabelColor, iconName: editLabelIcon });
                                  setEditingLabelId(null);
                                }}
                                className="text-[#b7c4ff] hover:text-white shrink-0"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 group px-1 py-0.5 rounded-lg hover:bg-white/5 transition-colors">
                              <button
                                onClick={() => handleToggleTag(lbl.id)}
                                className={cn("flex items-center gap-1.5 flex-1 min-w-0 text-left transition-opacity",
                                  active ? "opacity-100" : "opacity-60 hover:opacity-100"
                                )}
                              >
                                <LabelTag label={lbl} size="sm" />
                                {active && <Check className="w-3.5 h-3.5 text-[#b7c4ff] ml-auto shrink-0" />}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingLabelId(lbl.id);
                                  setEditLabelName(lbl.title);
                                  setEditLabelColor(lbl.color);
                                  setEditLabelIcon(lbl.iconName);
                                }}
                                className="p-1 text-[#8d909a] hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteLabel(lbl.id)}
                                className="p-1 text-[#8d909a] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Create new label */}
                  <div className="border-t border-[#2a2a2a] pt-2">
                    <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-1.5">Nova etiqueta</p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={newLabelColor}
                        onChange={e => setNewLabelColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                      />
                      <input
                        value={newLabelName}
                        onChange={e => setNewLabelName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newLabelName.trim()) {
                            addLabel({ title: newLabelName.trim(), color: newLabelColor, iconName: newLabelIcon });
                            setNewLabelName('');
                          }
                        }}
                        className="flex-1 bg-[#242424] text-xs text-white px-2 py-1 rounded-lg outline-none placeholder:text-[#8d909a] min-w-0 border border-[#2a2a2a] focus:border-[#b7c4ff]/40"
                        placeholder="Nome da etiqueta"
                      />
                      <button
                        onClick={() => {
                          if (!newLabelName.trim()) return;
                          addLabel({ title: newLabelName.trim(), color: newLabelColor, iconName: newLabelIcon });
                          setNewLabelName('');
                        }}
                        className="px-2 py-1 rounded-lg bg-[#b7c4ff]/20 text-[#b7c4ff] text-xs hover:bg-[#b7c4ff]/30 transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Icon picker */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        'solar:tag-linear', 'solar:check-circle-linear', 'solar:clock-circle-linear',
                        'solar:fire-linear', 'solar:star-linear', 'solar:flag-linear',
                        'solar:bolt-linear', 'solar:heart-linear', 'solar:send-square-linear',
                        'solar:close-circle-linear',
                      ].map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewLabelIcon(icon)}
                          className={cn(
                            'w-6 h-6 flex items-center justify-center rounded-lg transition-colors',
                            newLabelIcon === icon ? 'bg-[#b7c4ff]/20 text-[#b7c4ff]' : 'text-[#8d909a] hover:text-white hover:bg-white/5'
                          )}
                          title={icon}
                        >
                          <Icon icon={icon} className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1" />
            <div className="relative flex items-center gap-1">
              {localAssignees.length > 0 && (
                <div className="flex -space-x-1.5">
                  {localAssignees.map((a, i) => (
                    <img key={i} src={a.avatar} alt={a.name} className="w-7 h-7 rounded-full border-2 border-[#0d0d0d] object-cover" title={a.name} />
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowAssigneePicker(v => !v)}
                className="w-7 h-7 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/40 hover:border-white/60 hover:text-white/70 transition-colors"
                title="Gerenciar membros"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {showAssigneePicker && (
                <div className="absolute top-9 right-0 z-20 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl shadow-2xl p-3 w-52">
                  <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-2">Membros</p>
                  <div className="flex flex-col gap-1">
                    {availableMembers.map(name => {
                      const assigned = localAssignees.some(a => a.name === name);
                      return (
                        <button
                          key={name}
                          onClick={() => handleToggleAssignee(name)}
                          className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left",
                            assigned ? "bg-[#b7c4ff]/10 text-[#b7c4ff]" : "text-[#e5e2e1] hover:bg-[#2a2a2a]"
                          )}
                        >
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a2a2a&color=e5e2e1`} alt={name} className="w-6 h-6 rounded-full" />
                          <span className="flex-1">{name}</span>
                          {assigned && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setShowAssigneePicker(false)} className="mt-2 w-full text-xs text-[#8d909a] hover:text-[#e5e2e1] py-1 transition-colors">Fechar</button>
                </div>
              )}
            </div>
            <button
              onClick={handleCompleteTask}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#81c784]/10 text-[#81c784] hover:bg-[#81c784]/20 text-xs font-semibold transition-colors border border-[#81c784]/20 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Concluir
            </button>
          </div>
        </div>

        {/* ─── Body: Left tabs + Right chat ─── */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Left column: tab bar + content */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-[#2a2a2a]">

            {/* ─── Tab Bar ─── */}
            <div className="flex-shrink-0 flex gap-1 p-1 bg-[#1c1c1c] border-b border-white/5">
              {TASK_TABS.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                    )}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ─── Tab Content ─── */}
            <div className="flex-1 overflow-hidden min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="h-full overflow-y-auto"
                >


              {/* ── Visão Geral ── */}
              {activeTab === 'overview' && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <DesignSpecField
                        label="Direção Criativa"
                        value={task.designSpecs?.creativeDirection || ''}
                        placeholder="Ex: Seguir briefing"
                        onSave={v => updateTask(task.id, { designSpecs: { ...task.designSpecs, creativeDirection: v } })}
                      />
                      <DesignSpecField
                        label="Tamanhos Necessários"
                        value={task.designSpecs?.sizes || ''}
                        placeholder="Ex: 2000x2000"
                        onSave={v => updateTask(task.id, { designSpecs: { ...task.designSpecs, sizes: v } })}
                      />
                      <DesignSpecField
                        label="Tipos de Arquivo"
                        value={task.designSpecs?.fileTypes || ''}
                        placeholder="Ex: jpg, png"
                        onSave={v => updateTask(task.id, { designSpecs: { ...task.designSpecs, fileTypes: v } })}
                      />
                    </div>
                  </div>

                  <CollapsibleSection
                    title="Descrição"
                    icon={AlignLeft}
                    action={<button className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">Editar</button>}
                  >
                    <textarea
                      className="w-full h-32 bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 text-sm text-[#8d909a] focus:outline-none focus:border-[#b7c4ff]/50 resize-none"
                      placeholder="Adicione uma descrição mais detalhada..."
                      defaultValue={t("kanban.taskDetailsPlaceholder")}
                    />
                  </CollapsibleSection>
                  <CollapsibleSection
                    title="Texto do Design"
                    icon={Type}
                    action={<button className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">Editar</button>}
                  >
                    <textarea
                      className="w-full h-24 bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 text-sm text-[#8d909a] focus:outline-none focus:border-[#b7c4ff]/50 resize-none"
                      placeholder="Adicione o texto/copy que deve ir na arte..."
                    />
                  </CollapsibleSection>
                  <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-[#8d909a]" />
                      <h3 className="text-sm font-semibold text-[#e5e2e1]">Prioridade Interna</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-[#8d909a] uppercase tracking-wider">equipe</span>
                    </div>
                    <p className="text-[11px] text-[#8d909a]">Visível apenas para a equipe interna.</p>
                    <select
                      value={task.internalPriority || ""}
                      onChange={(e) => updateTask(task.id, { internalPriority: e.target.value || undefined })}
                      className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50"
                    >
                      <option value="">— Não definida —</option>
                      <option value="Crítico">🔴 Crítico</option>
                      <option value="Alto">🟠 Alto</option>
                      <option value="Normal">🟡 Normal</option>
                      <option value="Baixo">🟢 Baixo</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Checklist ── */}
              {activeTab === "checklist" && (
                <div className="p-5 flex flex-col gap-4">
                  <CollapsibleSection
                    title={`Checklist${(task.checklist?.length ?? 0) > 0 ? ` (${task.checklist!.filter(i => i.done).length}/${task.checklist!.length})` : ''}`}
                    icon={ListChecks}
                    forceOpen={activeStrip === "checklist"}
                    action={
                      <button
                        onClick={e => { e.stopPropagation(); handleAddChecklistItem(); }}
                        className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors"
                      >
                        + Item
                      </button>
                    }
                  >
                    <div className="flex flex-col gap-2">
                      {(task.checklist || []).map(item => (
                        <div key={item.id} className="flex items-center gap-2 group/ci">
                          <button onClick={() => handleToggleChecklistItem(item.id)} className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                            item.done ? "bg-[#81c784] border-[#81c784]" : "border-[#555] hover:border-[#b7c4ff]"
                          )}>
                            {item.done && <Check className="w-3 h-3 text-black" />}
                          </button>
                          <span className={cn("flex-1 text-sm", item.done ? "line-through text-[#555]" : "text-[#e5e2e1]")}>{item.text}</span>
                          <button onClick={() => handleDeleteChecklistItem(item.id)} className="opacity-0 group-hover/ci:opacity-100 text-[#8d909a] hover:text-[#ffb4ab] transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          value={newChecklistItem}
                          onChange={e => setNewChecklistItem(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddChecklistItem()}
                          placeholder="Novo item..."
                          className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 placeholder:text-[#555]"
                        />
                        <button onClick={handleAddChecklistItem} className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">+</button>
                      </div>
                    </div>
                  </CollapsibleSection>
                  <CollapsibleSection
                    title={`Sub-tarefas${(task.subTaskIds?.length ?? 0) > 0 ? ` (${task.subTaskIds!.length})` : ''}`}
                    icon={Link2}
                    forceOpen={activeStrip === "subtask"}
                    action={
                      <button
                        onClick={e => { e.stopPropagation(); setShowSubTaskPicker(v => !v); setSubTaskSearch(""); }}
                        className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors"
                      >
                        + Vincular
                      </button>
                    }
                  >
                    <div className="flex flex-col gap-2">
                      {showSubTaskPicker && (
                        <div className="mb-2">
                          <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                            <input
                              autoFocus
                              value={subTaskSearch}
                              onChange={e => setSubTaskSearch(e.target.value)}
                              placeholder="Buscar tarefa..."
                              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg pl-8 pr-3 py-1.5 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 placeholder:text-[#555]"
                            />
                          </div>
                          {linkableTasks.length === 0 ? (
                            <p className="text-xs text-[#555] text-center py-1">Nenhuma tarefa encontrada</p>
                          ) : (
                            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                              {linkableTasks.slice(0, 8).map(t => {
                                const linked = (task.subTaskIds || []).includes(t.id);
                                const cfg = priorityConfig[t.priority as Priority] || priorityConfig['Média'];
                                return (
                                  <button key={t.id} onClick={() => handleToggleSubTask(t.id)}
                                    className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors",
                                      linked ? "bg-[#b7c4ff]/10 text-[#b7c4ff]" : "text-[#e5e2e1] hover:bg-[#2a2a2a]"
                                    )}
                                  >
                                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", cfg.bg, cfg.color, cfg.border)}>
                                      {t.priority.slice(0, 1)}
                                    </span>
                                    <span className="flex-1 truncate">{t.title}</span>
                                    {linked && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      {task.subTaskIds?.map(id => {
                        const linked = allTasks.find(t => t.id === id);
                        if (!linked) return null;
                        const cfg = priorityConfig[linked.priority as Priority] || priorityConfig['Média'];
                        const statusLabel: Record<string, string> = { 'todo': 'A Fazer', 'in-progress': 'Em Progresso', 'review': 'Revisão', 'done': 'Concluído' };
                        return (
                          <div key={id} className="flex items-center gap-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 group/st">
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", cfg.bg, cfg.color, cfg.border)}>
                              {linked.priority.slice(0, 1)}
                            </span>
                            <span className="flex-1 text-sm text-[#e5e2e1] truncate">{linked.title}</span>
                            <span className="text-[10px] text-[#8d909a] shrink-0">{statusLabel[linked.status] || linked.status}</span>
                            <button onClick={() => handleToggleSubTask(id)} className="opacity-0 group-hover/st:opacity-100 text-[#8d909a] hover:text-[#ffb4ab] transition-all ml-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleSection>
                  <CollapsibleSection
                    title="Equipe Técnica"
                    icon={Terminal}
                    action={<button className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">Editar</button>}
                  >
                    <textarea
                      className="w-full h-24 bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 text-sm text-[#8d909a] focus:outline-none focus:border-[#b7c4ff]/50 resize-none font-mono"
                      placeholder="Notas para desenvolvedores, links de repositório, etc..."
                    />
                  </CollapsibleSection>
                </div>
              )}

              {/* ── Ativos ── */}
              {activeTab === "assets" && (
                <div className="p-5 flex flex-col gap-4">
                  <CollapsibleSection
                    title={`Anexos (${attachments.length})`}
                    icon={Paperclip}
                    action={
                      <div className="relative">
                        <input type="file" id="file-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleAddAttachment} disabled={isUploading} />
                        <label htmlFor="file-upload" className={cn("px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors flex items-center gap-1 cursor-pointer", isUploading && "opacity-50 cursor-not-allowed")}>
                          <Plus className="w-3 h-3" /> {isUploading ? `${Math.round(uploadProgress)}%` : 'Adicionar'}
                        </label>
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-3">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-[#131313] border border-[#2a2a2a] group/att">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-[#8d909a]"><Paperclip className="w-4 h-4" /></div>
                            <div>
                              <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#e5e2e1] hover:underline">{att.name}</a>
                              <p className="text-xs text-[#8d909a]">{(att.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button onClick={() => deleteAttachment(att.id)} className="text-[#8d909a] opacity-0 group-hover/att:opacity-100 hover:text-[#ffb4ab] transition-all"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      {attachments.length === 0 && !isUploading && <p className="text-sm text-[#8d909a] text-center py-2">Nenhum anexo adicionado.</p>}
                    </div>
                  </CollapsibleSection>
                  <CollapsibleSection title="Ativos de Marca" icon={FolderHeart}>
                    {brandHub ? (
                      <div className="space-y-4">
                        {brandHub.colors.length > 0 && (
                          <div>
                            <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-2">Cores</p>
                            <div className="flex flex-wrap gap-2">
                              {brandHub.colors.map(color => (
                                <button key={color.id} onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(`Copiado: ${color.hex}`); }} className="flex items-center gap-2 bg-[#131313] border border-[#2a2a2a] rounded-lg px-2 py-1.5 hover:border-[#b7c4ff]/50 transition-colors" title="Clique para copiar o hex">
                                  <div className="w-4 h-4 rounded-sm border border-white/10 shrink-0" style={{ background: color.hex }} />
                                  <span className="text-xs font-mono text-[#e5e2e1]">{color.hex}</span>
                                  {color.name && <span className="text-xs text-[#8d909a]">{color.name}</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {brandHub.fonts.length > 0 && (
                          <div>
                            <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-2">Fontes</p>
                            <div className="flex flex-col gap-1.5">
                              {brandHub.fonts.map(font => (
                                <div key={font.id} className="flex items-center justify-between bg-[#131313] border border-[#2a2a2a] rounded-lg px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-[#8d909a]" />
                                    <span className="text-sm text-[#e5e2e1]">{font.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#8d909a] uppercase tracking-wider">{font.type}</span>
                                  </div>
                                  {font.type === 'google' && font.googleFontName && (<a href={`https://fonts.google.com/download?family=${encodeURIComponent(font.googleFontName)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b7c4ff] hover:underline">Download</a>)}
                                  {font.type === 'file' && font.fileUrl && (<a href={font.fileUrl} download className="text-xs text-[#b7c4ff] hover:underline">Download</a>)}
                                  {font.type === 'link' && font.linkUrl && (<a href={font.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b7c4ff] hover:underline">Ver</a>)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {brandHub.logos.length > 0 && (
                          <div>
                            <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-2">Logos</p>
                            <div className="flex flex-wrap gap-2">
                              {brandHub.logos.map(logo => (
                                <a key={logo.id} href={logo.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 bg-[#131313] border border-[#2a2a2a] rounded-lg hover:border-[#b7c4ff]/50 transition-colors">
                                  <img src={logo.url} alt={logo.name} className="w-12 h-12 object-contain" />
                                  <span className="text-[10px] text-[#8d909a]">{logo.format?.toUpperCase() || "IMG"}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        <Link to={`/app/brand-hub/${brandHub.id}`} className="inline-flex items-center gap-1.5 text-xs text-[#b7c4ff] hover:underline">
                          <FolderHeart className="w-3.5 h-3.5" />
                          Abrir Brand Hub completo
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-[#8d909a]">Nenhum Brand Hub vinculado a este projeto/cliente.</p>
                    )}
                  </CollapsibleSection>
                </div>
              )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right column: Chat (always visible) */}
          <div className="w-[360px] flex flex-col flex-shrink-0">
                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {messages.map((msg) => {
                      const isCurrentUser = msg.senderId === MOCK_USER.uid;
                      return (
                        <div key={msg.id} className={cn("flex gap-3", isCurrentUser ? "flex-row-reverse" : "")}>
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", isCurrentUser ? "bg-[#b7c4ff] text-[#002682]" : "bg-[#2a2a2a] text-[#e5e2e1]")}>
                            {msg.sender}
                          </div>
                          <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
                            <div className={cn("flex items-baseline gap-2 mb-1", isCurrentUser ? "flex-row-reverse" : "")}>
                              <span className="text-sm font-medium text-[#e5e2e1]">{msg.senderName}</span>
                              <span className="text-[10px] text-[#8d909a]">{msg.time}</span>
                            </div>
                            <div className={cn("border rounded-2xl p-3 text-sm max-w-[360px] relative group", isCurrentUser ? "bg-[#b7c4ff]/10 border-[#b7c4ff]/20 text-[#b7c4ff] rounded-tr-none" : "bg-[#1c1c1c] border-[#2a2a2a] text-[#8d909a] rounded-tl-none")}>
                              {isCurrentUser && (
                                <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#131313] border border-[#2a2a2a] rounded-lg p-1 shadow-lg z-10">
                                  <button onClick={() => startEditingComment(msg)} className="p-1 text-[#8d909a] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors" title="Editar"><Edit2 className="w-3 h-3" /></button>
                                  <button onClick={() => deleteComment(msg.id)} className="p-1 text-[#8d909a] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded transition-colors" title="Excluir"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                              {editingCommentId === msg.id ? (
                                <div className="flex flex-col gap-2">
                                  <textarea autoFocus value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 resize-none min-h-[60px]" />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-medium text-[#8d909a] hover:text-[#e5e2e1]">Cancelar</button>
                                    <button onClick={() => saveEditComment(msg.id)} className="text-[10px] font-medium text-[#b7c4ff] hover:text-[#b7c4ff]/80">Salvar</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {msg.text && <p>{msg.text}</p>}
                                  {msg.image && (
                                    <div className="mt-3 relative group/img overflow-hidden rounded-lg border border-[#2a2a2a]">
                                      <img src={msg.image} alt="Anexo" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button onClick={() => onOpenFeedback(msg.image!)} className="bg-[#b7c4ff] text-[#002682] px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-2 transform translate-y-4 group-hover/img:translate-y-0 transition-all">
                                          <MousePointerClick className="w-4 h-4" />
                                          Feedback Visual
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t border-[#2a2a2a] bg-[#1c1c1c]">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input type="file" id="image-upload" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleSendImage} disabled={isUploading} />
                        <label htmlFor="image-upload" className={cn("p-3 rounded-xl bg-[#131313] border border-[#2a2a2a] text-[#8d909a] hover:text-[#b7c4ff] hover:border-[#b7c4ff]/50 transition-colors flex items-center justify-center cursor-pointer", isUploading && "opacity-50 cursor-not-allowed")} title="Enviar Imagem">
                          <ImageIcon className="w-5 h-5" />
                        </label>
                      </div>
                      <div className="relative flex-1">
                        <input ref={chatInputRef} type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Digite sua mensagem..." className="w-full bg-[#131313] border border-[#2a2a2a] rounded-xl py-3 pl-4 pr-12 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 transition-colors placeholder:text-[#8d909a]" />
                        <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#b7c4ff] hover:bg-[#b7c4ff]/10 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { t } = useTranslation();
  const { projectId, clientId } = useParams();
  const [activeTab, setActiveTab] = useState('criacao-conteudo');
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusChat, setFocusChat] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const tasks = useStore((state) => state.tasks);
  const updateTask = useStore((state) => state.updateTask);
  const projects = useStore((state) => state.projects);
  const clients = useStore((state) => state.clients);

  const currentProject = projectId ? projects.find(p => p.id === projectId) : null;
  const currentClient = clientId ? clients.find(c => c.id === clientId) : null;
  const currentProjectId = projectId || null;
  const backLink = clientId ? '/tasks' : projectId ? `/projects/${projectId}` : '/tasks';
  const boardTitle = currentProject?.name || currentClient?.name || 'Kanban';

  const [columns, setColumns] = useState<Record<string, ColumnData>>({});

  useEffect(() => {
    // Filter tasks by projectId or clientId, exclude archived
    const projectTasks = tasks.filter(t => {
      if (t.status === 'archived') return false;
      if (clientId) return t.clientId === clientId;
      return t.projectId === currentProjectId;
    });

    // Group tasks by status
    const newColumns: Record<string, ColumnData> = {
      todo: { ...columnDefs.todo, tasks: [] },
      'in-progress': { ...columnDefs['in-progress'], tasks: [] },
      review: { ...columnDefs.review, tasks: [] },
      done: { ...columnDefs.done, tasks: [] }
    };

    projectTasks.forEach(task => {
      const status = task.status || 'todo';
      if (newColumns[status]) {
        // Map to the format expected by TaskCard
        newColumns[status].tasks.push({
          ...task,
          assignees: task.assignees ? task.assignees.map(a => ({ name: a, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(a)}&background=random` })) : [],
          date: task.dueDate || (task as any).date || t('kanban.noDate'),
        } as unknown as Task);
      }
    });

    setColumns(newColumns);
  }, [tasks, currentProjectId, clientId]);

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState<{ id: string, columnId: string } | null>(null);
  const [dragOverTask, setDragOverTask] = useState<{ id: string, columnId: string } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Drag to scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const draggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggedRef.current = false;
    if ((e.target as HTMLElement).closest('.task-card')) return;
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    draggedRef.current = true;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, columnId: string) => {
    e.stopPropagation();
    draggedRef.current = true;
    setDraggedTask({ id: taskId, columnId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) el.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation();
    setDraggedTask(null);
    setDragOverTask(null);
    setDragOverColumn(null);
    const el = document.getElementById(`task-${taskId}`);
    if (el) el.style.opacity = '1';
    draggedRef.current = false;
  };

  const handleDragOverTask = (e: React.DragEvent, columnId: string, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTask?.id === taskId) return;
    setDragOverTask({ id: taskId, columnId });
    setDragOverColumn(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
    setDragOverTask(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string, targetTaskId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask) return;
    
    const { id: sourceId, columnId: sourceColumnId } = draggedTask;
    if (sourceId === targetTaskId) {
      setDraggedTask(null);
      setDragOverTask(null);
      setDragOverColumn(null);
      return;
    }

    // Optimistic UI update
    setColumns(prev => {
      const newColumns = { ...prev };
      const sourceColumn = { ...newColumns[sourceColumnId] };
      const targetColumn = { ...newColumns[targetColumnId] };
      
      sourceColumn.tasks = [...sourceColumn.tasks];
      targetColumn.tasks = sourceColumnId === targetColumnId ? sourceColumn.tasks : [...targetColumn.tasks];
      
      const taskIndex = sourceColumn.tasks.findIndex(t => t.id === sourceId);
      if (taskIndex === -1) return prev;
      
      const task = sourceColumn.tasks[taskIndex];
      sourceColumn.tasks.splice(taskIndex, 1);
      
      if (targetTaskId) {
        const targetIndex = targetColumn.tasks.findIndex(t => t.id === targetTaskId);
        const insertIndex = targetIndex >= 0 ? targetIndex : targetColumn.tasks.length;
        targetColumn.tasks.splice(insertIndex, 0, task);
      } else {
        targetColumn.tasks.push(task);
      }
      
      newColumns[sourceColumnId] = sourceColumn;
      newColumns[targetColumnId] = targetColumn;
      
      return newColumns;
    });
    
    setDraggedTask(null);
    setDragOverTask(null);
    setDragOverColumn(null);

    // Persist status change to store
    if (sourceColumnId !== targetColumnId) {
      updateTask(sourceId, { status: targetColumnId as any });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto">
      <header className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={backLink} className="p-2 rounded-full hover:bg-[#202020] text-[#8d909a] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-headline font-bold tracking-tight text-[#e5e2e1]">
                {boardTitle}
              </h1>
              <p className="text-[#8d909a] text-xs mt-1">
                {(Object.values(columns) as ColumnData[]).reduce((acc, col) => acc + col.tasks.length, 0)} {t('kanban.activeTasks')}
                {currentProject ? ` • ${currentProject.stage}` : currentClient ? ` • ${currentClient.industry}` : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#b7c4ff] hover:bg-[#b7c4ff]/90 text-[#002682] font-semibold transition-colors text-sm shadow-sm shadow-[#b7c4ff]/20"
          >
            <Plus className="w-4 h-4" />
            {t('task.new')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-4">
          <button 
            onClick={() => setActiveTab('criacao-conteudo')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeTab === 'criacao-conteudo' 
                ? "bg-[#1a3b4a] text-[#6cd3fc] border border-[#264b5d]" 
                : "text-[#8d909a] hover:bg-[#202020]"
            )}
          >
            Criação de conteúdo <span className="ml-1 opacity-70">5</span>
          </button>
          <button 
            onClick={() => setActiveTab('geral')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeTab === 'geral' 
                ? "bg-[#1a3b4a] text-[#6cd3fc] border border-[#264b5d]" 
                : "text-[#8d909a] hover:bg-[#202020]"
            )}
          >
            Geral <span className="ml-1 opacity-70">0</span>
          </button>
          <button 
            onClick={() => setActiveTab('arquivadas')}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeTab === 'arquivadas' 
                ? "bg-[#1a3b4a] text-[#6cd3fc] border border-[#264b5d]" 
                : "text-[#8d909a] hover:bg-[#202020]"
            )}
          >
            <Archive className="w-3.5 h-3.5" />
            Arquivadas <span className="ml-1 opacity-70">{tasks.filter(t => t.status === 'archived' && (clientId ? t.clientId === clientId : t.projectId === currentProjectId)).length}</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveFilter('Todas')}
              className={cn(
                "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                activeFilter === 'Todas' ? "bg-[#2a2a2a] text-[#e5e2e1]" : "text-[#8d909a] hover:text-[#e5e2e1]"
              )}
            >
              Todas
            </button>
            <button 
              onClick={() => setActiveFilter('Urgente')}
              className={cn("flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full transition-colors", activeFilter === 'Urgente' ? "bg-[#ffb4ab]/10 text-[#ffb4ab]" : "text-[#8d909a] hover:text-[#e5e2e1]")}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></div>
              Urgente
            </button>
            <button 
              onClick={() => setActiveFilter('Alta')}
              className={cn("flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full transition-colors", activeFilter === 'Alta' ? "bg-[#ffb4ab]/10 text-[#ffb4ab]" : "text-[#8d909a] hover:text-[#e5e2e1]")}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></div>
              Alta
            </button>
            <button 
              onClick={() => setActiveFilter('Média')}
              className={cn("flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full transition-colors", activeFilter === 'Média' ? "bg-[#6cd3fc]/10 text-[#6cd3fc]" : "text-[#8d909a] hover:text-[#e5e2e1]")}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#6cd3fc]"></div>
              Média
            </button>
            <button 
              onClick={() => setActiveFilter('Baixa')}
              className={cn("flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full transition-colors", activeFilter === 'Baixa' ? "bg-[#81c784]/10 text-[#81c784]" : "text-[#8d909a] hover:text-[#e5e2e1]")}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#81c784]"></div>
              Baixa
            </button>
          </div>

          </div>

          <div className="flex items-center gap-4">
            <input 
              type="text"
              placeholder={t('kanban.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl py-1.5 pl-4 pr-4 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 transition-colors"
            />
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] text-xs font-medium text-[#8d909a] hover:text-[#e5e2e1] transition-colors">
              Todas as tags
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Conditional Rendering between Kanban and Archived Tasks */}
      {activeTab === 'arquivadas' ? (
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const archivedTasks = tasks.filter(t =>
              t.status === 'archived' && (clientId ? t.clientId === clientId : t.projectId === currentProjectId)
            );
            if (archivedTasks.length === 0) {
              return (
                <div className="bg-[#131313] rounded-2xl border border-[#2a2a2a] p-12 flex flex-col items-center justify-center gap-4">
                  <Archive className="w-12 h-12 text-[#2a2a2a]" />
                  <h3 className="text-lg font-headline font-semibold text-[#e5e2e1]">{t('kanban.noArchivedTasks')}</h3>
                  <p className="text-sm text-[#8d909a] max-w-md text-center">
                    {t('kanban.archivedInfo')}
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-3">
                {archivedTasks.map(task => (
                  <div key={task.id} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4 flex items-center justify-between gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[#e5e2e1] truncate">{task.title}</p>
                        {task.completedAt && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#81c784]/15 text-[#81c784] font-semibold uppercase tracking-wider">
                            Concluída
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8d909a]">
                        <span>{task.assignees?.join(', ')}</span>
                        {task.completedAt && (
                          <span>Concluída em {new Date(task.completedAt).toLocaleDateString('pt-BR')}</span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <TaskLabelList labelIds={task.tags} />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        updateTask(task.id, { status: 'todo', completedAt: undefined });
                        toast.success(t('kanban.taskReopened'));
                      }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-[#8d909a] hover:text-[#e5e2e1] text-xs font-medium transition-colors"
                      title={t('kanban.reopenTask')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {t('kanban.reopen')}
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      ) : (
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          "flex-1 flex gap-6 overflow-x-auto pb-4 items-start scrollbar-hide",
          isDragging ? "cursor-grabbing select-none" : ""
        )}
      >
        {Object.entries(columns).map(([key, column]: [string, ColumnData]) => (
          <div 
            key={key} 
            className={cn(
              "flex-shrink-0 w-[320px] flex flex-col gap-3 rounded-2xl transition-colors p-1",
              dragOverColumn === key ? "bg-[#2a2a2a]/30" : ""
            )}
            onDragOver={(e) => handleDragOverColumn(e, key)}
            onDrop={(e) => handleDrop(e, key)}
          >
            <div className="flex items-start justify-between px-1 mb-2">
              <div className="flex items-start gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", column.color)} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-semibold text-sm text-[#e5e2e1]">{column.title}</h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#2a2a2a] text-[10px] font-medium text-[#8d909a]">
                      {column.tasks.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8d909a] mt-0.5">{column.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-[#202020] text-[#8d909a] transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-[#202020] text-[#8d909a] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-h-[150px]">
              <AnimatePresence>
                {column.tasks
                  .filter(task => activeFilter === 'Todas' || task.priority === activeFilter)
                  .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTaskId(task.id)}
                    onCommentClick={(e) => {
                      e.stopPropagation();
                      setSelectedTaskId(task.id);
                      setFocusChat(true);
                    }}
                    onComplete={() => {
                      updateTask(task.id, { status: 'archived', completedAt: new Date().toISOString() });
                      toast.success(t('kanban.taskDone'));
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, key)}
                    onDragEnd={(e) => handleDragEnd(e, task.id)}
                    onDragOver={(e) => handleDragOverTask(e, key, task.id)}
                    onDrop={(e) => handleDrop(e, key, task.id)}
                    isDragOver={dragOverTask?.id === task.id}
                  />
                ))}
              </AnimatePresence>
              {column.tasks.filter(task => activeFilter === 'Todas' || task.priority === activeFilter).length === 0 && (
                <div className="flex-1 border-2 border-dashed border-[#2a2a2a] rounded-xl flex items-center justify-center text-xs text-[#8d909a] p-4 text-center pointer-events-none">
                  Nenhuma tarefa {activeFilter !== 'Todas' ? `com prioridade ${activeFilter}` : 'nesta coluna'}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Nova Coluna */}
        <div className="flex-shrink-0 w-[320px]">
          <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2a2a2a] hover:border-[#b7c4ff]/50 hover:bg-[#b7c4ff]/5 text-[#8d909a] hover:text-[#b7c4ff] transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" />
            Nova Coluna
          </button>
        </div>
      </div>
      )}

      {selectedTaskId && (() => {
        const storeTask = tasks.find(t => t.id === selectedTaskId);
        return storeTask ? (
          <TaskDetailModal
            task={storeTask}
            onClose={() => { setSelectedTaskId(null); setFocusChat(false); }}
            focusChat={focusChat}
            projectId={currentProjectId || undefined}
          />
        ) : null;
      })()}

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        clientId={clientId || undefined}
        projectId={currentProjectId || undefined}
      />
    </div>
  );
}
