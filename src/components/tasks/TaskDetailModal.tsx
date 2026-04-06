import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import {
  ChevronLeft, Plus, AlertCircle, X, Send, AlignLeft, MousePointerClick, Type,
  FolderHeart, Trash2, Edit2, CheckCircle2, Tag, EyeOff, Link2, Search,
  ListChecks, Layers, ChevronDown, Paperclip, MessageSquareDashed, Check,
  Terminal, Calendar,
} from 'lucide-react';
import { LabelTag } from '../LabelTag';
import { Link } from 'react-router-dom';
import { cn, compressImage } from '../../lib/utils';
import { useStore } from '../../store';
import type { Task } from '../../store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

// ─── Shared constants ────────────────────────────────────────────────────────

const MOCK_USER = { uid: 'local-user', displayName: 'Yuri', photoURL: null };

const priorityConfig = {
  'Urgente': { color: 'text-[#ffb4ab]', bg: 'bg-[#ffb4ab]/10', border: 'border-[#ffb4ab]/20', icon: AlertCircle },
  'Alta':    { color: 'text-[#ffb4ab]', bg: 'bg-[#ffb4ab]/10', border: 'border-[#ffb4ab]/20', icon: AlertCircle },
  'Média':   { color: 'text-[#6cd3fc]', bg: 'bg-[#6cd3fc]/10', border: 'border-[#6cd3fc]/20', icon: null },
  'Baixa':   { color: 'text-[#81c784]', bg: 'bg-[#81c784]/10', border: 'border-[#81c784]/20', icon: null },
} as const;

type Priority = keyof typeof priorityConfig;

interface Assignee { name: string; avatar: string; }

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

interface LocalPin {
  id: string;
  x: number;
  y: number;
  text: string;
  resolved: boolean;
  author: string;
}

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  'task-feedback-test': [
    {
      id: 'msg-seed-001', sender: 'Y', senderName: 'Yuri', senderId: 'local-user', time: '09:15',
      text: 'Primeira versão do layout — já deixei alguns comentários de feedback visual aqui 👇',
      image: 'https://picsum.photos/seed/feedback/800/500',
    },
    {
      id: 'msg-seed-002', sender: 'Y', senderName: 'Yuri', senderId: 'local-user', time: '09:22',
      text: 'Essa é a versão mobile — ainda sem nenhum feedback, pode anotar direto:',
      image: 'https://picsum.photos/seed/mobile/800/500',
    },
  ],
};

// ─── VisualFeedbackModal ──────────────────────────────────────────────────────

function VisualFeedbackModal({ taskId, imageUrl, onClose }: { taskId: string; imageUrl: string; onClose: () => void }) {
  const { t } = useTranslation();
  const storePins   = useStore(s => s.pins);
  const addPin      = useStore(s => s.addPin);
  const updatePin   = useStore(s => s.updatePin);
  const deletePinFromStore = useStore(s => s.deletePin);

  const pins = storePins.filter(p => p.taskId === taskId && p.imageUrl === imageUrl);
  const [draftPin, setDraftPin]       = useState<{ x: number; y: number } | null>(null);
  const [draftText, setDraftText]     = useState('');
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [editPinText, setEditPinText]   = useState('');
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('.pin-marker')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDraftPin({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
    setDraftText('');
    setActivePinId(null);
  };

  const saveDraftPin = () => {
    if (!draftPin || !draftText.trim()) return;
    addPin({ taskId, imageUrl, x: draftPin.x, y: draftPin.y, text: draftText, resolved: false, author: MOCK_USER.displayName });
    setDraftPin(null);
    setDraftText('');
  };

  const toggleResolve = (id: string, currentResolved: boolean) => updatePin(id, { resolved: !currentResolved });

  const deletePin = (id: string) => {
    if (!window.confirm(t('kanban.confirmDeleteComment'))) return;
    deletePinFromStore(id);
    if (activePinId === id) setActivePinId(null);
  };

  const startEditingPin = (pin: LocalPin) => { setEditingPinId(pin.id); setEditPinText(pin.text); };

  const saveEditPin = (id: string) => {
    if (!editPinText.trim()) return;
    updatePin(id, { text: editPinText });
    setEditingPinId(null);
    setEditPinText('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#0a0a0a] animate-in fade-in duration-200">
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

      <div className="flex w-full h-full pt-16">
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center p-8">
          <div ref={imageContainerRef} className="relative max-w-full max-h-full shadow-2xl cursor-crosshair" onClick={handleImageClick}>
            <img src={imageUrl} alt="Feedback target" className="max-w-full max-h-full object-contain rounded-lg border border-[#2a2a2a]" referrerPolicy="no-referrer" />
            {pins.map((pin, index) => (
              <div key={pin.id} className={cn("pin-marker absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer transition-transform hover:scale-110", pin.resolved ? "bg-[#81c784] text-[#0a0a0a]" : "bg-[#ffb4ab] text-[#0a0a0a]", activePinId === pin.id && "ring-4 ring-white/20")} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} onClick={(e) => { e.stopPropagation(); setActivePinId(pin.id); setDraftPin(null); }}>
                {index + 1}
              </div>
            ))}
            {draftPin && (
              <div className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-[#b7c4ff] text-[#002682] flex items-center justify-center text-sm font-bold shadow-lg animate-bounce" style={{ left: `${draftPin.x}%`, top: `${draftPin.y}%` }}>+</div>
            )}
          </div>
        </div>

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
                  <div className="w-6 h-6 rounded-full bg-[#b7c4ff] text-[#002682] flex items-center justify-center text-xs font-bold">+</div>
                  <span className="text-sm font-medium text-[#e5e2e1]">Novo Comentário</span>
                </div>
                <textarea autoFocus value={draftText} onChange={e => setDraftText(e.target.value)} placeholder="Descreva a alteração necessária..." className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 resize-none h-24 mb-3" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setDraftPin(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#8d909a] hover:bg-[#2a2a2a] transition-colors">Cancelar</button>
                  <button onClick={saveDraftPin} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#b7c4ff] text-[#002682] hover:bg-[#b7c4ff]/90 transition-colors">Salvar</button>
                </div>
              </div>
            )}
            {pins.map((pin, index) => (
              <div key={pin.id} className={cn("bg-[#1c1c1c] border rounded-xl p-4 transition-colors cursor-pointer", activePinId === pin.id ? "border-[#b7c4ff]/50" : "border-[#2a2a2a] hover:border-[#333]", pin.resolved && "opacity-60")} onClick={() => setActivePinId(pin.id)}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", pin.resolved ? "bg-[#81c784] text-[#0a0a0a]" : "bg-[#ffb4ab] text-[#0a0a0a]")}>{index + 1}</div>
                    <span className="text-sm font-medium text-[#e5e2e1]">{pin.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {pin.author === MOCK_USER.displayName && (
                      <>
                        <button onClick={e => { e.stopPropagation(); startEditingPin(pin as unknown as LocalPin); }} className="p-1.5 rounded-md transition-colors bg-[#2a2a2a] text-[#8d909a] hover:text-[#e5e2e1]"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={e => { e.stopPropagation(); deletePin(pin.id); }} className="p-1.5 rounded-md transition-colors bg-[#2a2a2a] text-[#8d909a] hover:text-[#ffb4ab]"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                    <button onClick={e => { e.stopPropagation(); toggleResolve(pin.id, pin.resolved); }} className={cn("p-1.5 rounded-md transition-colors", pin.resolved ? "bg-[#81c784]/20 text-[#81c784]" : "bg-[#2a2a2a] text-[#8d909a] hover:text-[#e5e2e1]")}><Check className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {editingPinId === pin.id ? (
                  <div className="mt-2" onClick={e => e.stopPropagation()}>
                    <textarea autoFocus value={editPinText} onChange={e => setEditPinText(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 resize-none h-24 mb-3" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingPinId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#8d909a] hover:bg-[#2a2a2a] transition-colors">Cancelar</button>
                      <button onClick={() => saveEditPin(pin.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#b7c4ff] text-[#002682] hover:bg-[#b7c4ff]/90 transition-colors">Salvar</button>
                    </div>
                  </div>
                ) : (
                  <p className={cn("text-sm", pin.resolved ? "text-[#8d909a] line-through" : "text-[#e5e2e1]")}>{pin.text}</p>
                )}
              </div>
            ))}
            {pins.length === 0 && !draftPin && <div className="text-center py-10 text-[#8d909a] text-sm">{t('kanban.noComments')}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CollapsibleSection ───────────────────────────────────────────────────────

function CollapsibleSection({ title, icon: SectionIcon, defaultOpen = true, forceOpen, children, action }: {
  title: string; icon: React.ElementType; defaultOpen?: boolean; forceOpen?: boolean;
  children: React.ReactNode; action?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { if (forceOpen) setIsOpen(true); }, [forceOpen]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between group cursor-pointer hover:bg-[#2a2a2a]/30 p-2 -mx-2 rounded-lg transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <SectionIcon className="w-5 h-5 text-[#8d909a]" />
          <h3 className="text-base font-semibold text-[#e5e2e1]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
          <button className="text-[#8d909a] hover:text-[#e5e2e1] transition-colors p-1 rounded hover:bg-[#2a2a2a]">
            <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")} />
          </button>
        </div>
      </div>
      {isOpen && <div className="pl-8 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
    </div>
  );
}

// ─── DesignSpecField ──────────────────────────────────────────────────────────

function DesignSpecField({ label, value, placeholder, onSave }: { label: string; value: string; placeholder: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleBlur = () => { setEditing(false); if (draft !== value) onSave(draft); };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-[#8d909a] uppercase tracking-wider">{label}</span>
      {editing ? (
        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={handleBlur}
          onKeyDown={e => { if (e.key === 'Enter') handleBlur(); if (e.key === 'Escape') { setEditing(false); setDraft(value); } }}
          className="bg-[#0a0a0a] border border-[#b7c4ff]/50 rounded-md px-2 py-1 text-xs text-[#e5e2e1] focus:outline-none w-full" />
      ) : (
        <button onClick={() => { setDraft(value); setEditing(true); }} className="text-xs text-left text-[#e5e2e1] hover:text-[#b7c4ff] transition-colors truncate">
          {value || <span className="text-[#555] italic">{placeholder}</span>}
        </button>
      )}
    </div>
  );
}

// ─── TaskDetailModal ──────────────────────────────────────────────────────────

export function TaskDetailModal({ task, onClose, focusChat, projectId }: {
  task: Task;
  onClose: () => void;
  focusChat?: boolean;
  projectId?: string;
}) {
  const { t } = useTranslation();
  const { updateTask, projects, updateProject, addLabel, updateLabel, deleteLabel } = useStore();
  const storeLabels = useStore(s => s.labels);
  const brandhubs   = useStore(s => s.brandhubs);
  const allTasks    = useStore(s => s.tasks);
  const teamUsers   = useStore(s => s.teamUsers);

  const project  = projects.find(p => p.id === (task.projectId || projectId));
  const brandHub = brandhubs.find(h =>
    (task.clientId && h.clientId === task.clientId) ||
    (task.projectId && h.projectId === task.projectId) ||
    ((task.projectId || projectId) && h.projectId === (task.projectId || projectId))
  ) ?? null;

  // Map store assignees (string[]) → local Assignee[] for display
  const toAssignee = (name: string): Assignee => ({
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a2a2a&color=e5e2e1`,
  });

  const [localAssignees, setLocalAssignees] = useState<Assignee[]>(
    (task.assignees || []).map(toAssignee)
  );
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showLabelPicker,    setShowLabelPicker]    = useState(false);
  const [editingLabelId,     setEditingLabelId]     = useState<string | null>(null);
  const [editLabelName,      setEditLabelName]      = useState('');
  const [editLabelColor,     setEditLabelColor]     = useState('');
  const [editLabelIcon,      setEditLabelIcon]      = useState('');
  const [newLabelName,       setNewLabelName]       = useState('');
  const [newLabelColor,      setNewLabelColor]      = useState('#b7c4ff');
  const [newLabelIcon,       setNewLabelIcon]       = useState('solar:tag-linear');
  const [showSubTaskPicker,  setShowSubTaskPicker]  = useState(false);
  const [subTaskSearch,      setSubTaskSearch]      = useState('');
  const [newChecklistItem,   setNewChecklistItem]   = useState('');
  const [activeStrip,        setActiveStrip]        = useState<'subtask' | 'checklist' | null>(null);
  type TaskTab = 'overview' | 'checklist' | 'assets';
  const [activeTab,          setActiveTab]          = useState<TaskTab>('overview');
  const [feedbackImage,      setFeedbackImage]      = useState<string | null>(null);
  const [attachments] = useState<any[]>([]);
  const [isUploading,  setIsUploading]  = useState(false);
  const [uploadProgress] = useState(0);

  const availableMembers: string[] = project?.teamMembers?.map((m: any) => m.name)
    ?? teamUsers.map(u => u.name);

  const config = priorityConfig[task.priority as Priority] || priorityConfig['Média'];
  const PriorityIcon = config.icon;
  const taskTags = task.tags || [];
  const displayDate = task.dueDate || (task as any).date || 'Sem data';

  const [messages, setMessages] = useState<ChatMessage[]>(() => SEED_MESSAGES[task.id] ?? []);
  const [newMessage, setNewMessage] = useState('');
  const chatInputRef = React.useRef<HTMLInputElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText,  setEditCommentText]  = useState('');
  const [newTagInput,      setNewTagInput]      = useState('');

  React.useEffect(() => {
    if (focusChat) {
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [focusChat]);

  if (!task) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleAssignee = (name: string) => {
    const isAssigned = localAssignees.some(a => a.name === name);
    const updated = isAssigned ? localAssignees.filter(a => a.name !== name) : [...localAssignees, toAssignee(name)];
    setLocalAssignees(updated);
    updateTask(task.id, { assignees: updated.map(a => a.name) });
  };

  const handleToggleSubTask = (linkedId: string) => {
    const current = task.subTaskIds || [];
    updateTask(task.id, { subTaskIds: current.includes(linkedId) ? current.filter(id => id !== linkedId) : [...current, linkedId] });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    updateTask(task.id, { checklist: [...(task.checklist || []), { id: crypto.randomUUID(), text: newChecklistItem.trim(), done: false }] });
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (id: string) => {
    updateTask(task.id, { checklist: (task.checklist || []).map(i => i.id === id ? { ...i, done: !i.done } : i) });
  };

  const handleDeleteChecklistItem = (id: string) => {
    updateTask(task.id, { checklist: (task.checklist || []).filter(i => i.id !== id) });
  };

  const handleToggleTag = (tag: string) => {
    const current = task.tags || [];
    updateTask(task.id, { tags: current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag] });
  };

  const handleAddNewTag = () => {
    const tag = newTagInput.trim();
    if (!tag) return;
    updateTask(task.id, { tags: [...(task.tags || []), tag] });
    if (project && !(project.availableTags || []).includes(tag)) {
      updateProject(project.id, { availableTags: [...(project.availableTags || []), tag] });
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
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(), sender: MOCK_USER.displayName.charAt(0).toUpperCase(),
      senderName: MOCK_USER.displayName, senderId: MOCK_USER.uid,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newMessage,
    }]);
    setNewMessage('');
  };

  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(t('kanban.onlyImages')); if (e.target) e.target.value = ''; return; }
    if (file.size > 10 * 1024 * 1024) { toast.error(t('kanban.imageTooLarge')); if (e.target) e.target.value = ''; return; }
    setIsUploading(true);
    try {
      const imageUrl = await compressImage(file);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), sender: MOCK_USER.displayName.charAt(0).toUpperCase(),
        senderName: MOCK_USER.displayName, senderId: MOCK_USER.uid,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        image: imageUrl,
      }]);
      toast.success(t('kanban.imageUploaded'));
    } catch { toast.error(t('kanban.imageError')); }
    finally { setIsUploading(false); if (e.target) e.target.value = ''; }
  };

  const deleteComment = (id: string) => {
    if (!window.confirm(t('kanban.confirmDeleteComment'))) return;
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const startEditingComment = (msg: ChatMessage) => { setEditingCommentId(msg.id); setEditCommentText(msg.text || ''); };

  const saveEditComment = (id: string) => {
    if (!editCommentText.trim()) return;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editCommentText } : m));
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const linkableTasks = allTasks.filter(t =>
    t.id !== task.id && t.status !== 'archived' &&
    (t.projectId === (task.projectId || projectId) || t.clientId === task.clientId) &&
    (subTaskSearch === '' || t.title.toLowerCase().includes(subTaskSearch.toLowerCase()))
  );

  const TASK_TABS: { id: TaskTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',  label: 'Visão Geral', icon: Layers },
    { id: 'checklist', label: 'Checklist',   icon: ListChecks },
    { id: 'assets',    label: 'Ativos',      icon: FolderHeart },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#1c1c1c] w-full max-w-4xl h-[85vh] rounded-2xl border border-[#2a2a2a] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

          {/* ─── Gradient Header ─── */}
          <div className="flex-shrink-0 rounded-t-2xl px-6 pt-5 pb-4" style={{ background: 'linear-gradient(to bottom left, #1a1a2e 0%, #0d0d0d 100%)' }}>
            {/* Row 1: title + close */}
            <div className="flex items-start gap-3 mb-4">
              <input
                type="text"
                defaultValue={task.title}
                onBlur={e => { if (e.target.value.trim() !== task.title) { updateTask(task.id, { title: e.target.value.trim() }); toast.success(t('kanban.titleUpdated')); } }}
                className="flex-1 bg-transparent text-2xl font-headline font-bold text-white focus:outline-none border-b border-transparent focus:border-white/30 pb-1 transition-colors"
              />
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-colors shrink-0 mt-1"><X className="w-5 h-5" /></button>
            </div>

            {/* Row 2: priority + date + tags + assignees + complete */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border shrink-0", config.bg, config.color, config.border)}>
                {PriorityIcon && <PriorityIcon className="w-3 h-3" />}
                {task.priority}
              </div>
              <span className="text-xs text-white/50 flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {displayDate}
              </span>

              {taskTags.map(labelId => {
                const lbl = storeLabels.find(l => l.id === labelId);
                return lbl ? <LabelTag key={labelId} label={lbl} size="sm" onRemove={() => handleToggleTag(labelId)} /> : null;
              })}

              {/* Label picker */}
              <div className="relative">
                <button onClick={() => setShowLabelPicker(v => !v)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/40 border border-dashed border-white/20 hover:border-white/50 hover:text-white/70 transition-colors">
                  <Tag className="w-3 h-3" /><Plus className="w-2.5 h-2.5" />
                </button>
                {showLabelPicker && (
                  <div className="absolute top-7 left-0 z-20 bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-2xl p-3 w-72" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-[#8d909a] uppercase tracking-wider font-medium">Etiquetas</p>
                      <button onClick={() => setShowLabelPicker(false)} className="text-[#8d909a] hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto mb-2">
                      {storeLabels.length === 0 && <p className="text-xs text-[#8d909a] text-center py-2">Nenhuma etiqueta ainda</p>}
                      {storeLabels.map(lbl => {
                        const active = taskTags.includes(lbl.id);
                        const isEditing = editingLabelId === lbl.id;
                        return (
                          <div key={lbl.id}>
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-[#242424]">
                                <input type="color" value={editLabelColor} onChange={e => setEditLabelColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                                <input autoFocus value={editLabelName} onChange={e => setEditLabelName(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') { updateLabel(lbl.id, { title: editLabelName, color: editLabelColor, iconName: editLabelIcon }); setEditingLabelId(null); } else if (e.key === 'Escape') { setEditingLabelId(null); } }}
                                  className="flex-1 bg-transparent text-xs text-white outline-none min-w-0" placeholder="Nome" />
                                <button onClick={() => { updateLabel(lbl.id, { title: editLabelName, color: editLabelColor, iconName: editLabelIcon }); setEditingLabelId(null); }} className="text-[#b7c4ff] hover:text-white shrink-0"><Check className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 group px-1 py-0.5 rounded-lg hover:bg-white/5 transition-colors">
                                <button onClick={() => handleToggleTag(lbl.id)} className={cn("flex items-center gap-1.5 flex-1 min-w-0 text-left transition-opacity", active ? "opacity-100" : "opacity-60 hover:opacity-100")}>
                                  <LabelTag label={lbl} size="sm" />
                                  {active && <Check className="w-3.5 h-3.5 text-[#b7c4ff] ml-auto shrink-0" />}
                                </button>
                                <button onClick={() => { setEditingLabelId(lbl.id); setEditLabelName(lbl.title); setEditLabelColor(lbl.color); setEditLabelIcon(lbl.iconName); }} className="p-1 text-[#8d909a] hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0"><Edit2 className="w-3 h-3" /></button>
                                <button onClick={() => deleteLabel(lbl.id)} className="p-1 text-[#8d909a] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-[#2a2a2a] pt-2">
                      <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-1.5">Nova etiqueta</p>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={newLabelColor} onChange={e => setNewLabelColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                        <input value={newLabelName} onChange={e => setNewLabelName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && newLabelName.trim()) { addLabel({ title: newLabelName.trim(), color: newLabelColor, iconName: newLabelIcon }); setNewLabelName(''); } }}
                          className="flex-1 bg-[#242424] text-xs text-white px-2 py-1 rounded-lg outline-none placeholder:text-[#8d909a] min-w-0 border border-[#2a2a2a] focus:border-[#b7c4ff]/40" placeholder="Nome da etiqueta" />
                        <button onClick={() => { if (!newLabelName.trim()) return; addLabel({ title: newLabelName.trim(), color: newLabelColor, iconName: newLabelIcon }); setNewLabelName(''); }} className="px-2 py-1 rounded-lg bg-[#b7c4ff]/20 text-[#b7c4ff] text-xs hover:bg-[#b7c4ff]/30 transition-colors shrink-0"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['solar:tag-linear','solar:check-circle-linear','solar:clock-circle-linear','solar:fire-linear','solar:star-linear','solar:flag-linear','solar:bolt-linear','solar:heart-linear','solar:send-square-linear','solar:close-circle-linear'].map(icon => (
                          <button key={icon} onClick={() => setNewLabelIcon(icon)} className={cn('w-6 h-6 flex items-center justify-center rounded-lg transition-colors', newLabelIcon === icon ? 'bg-[#b7c4ff]/20 text-[#b7c4ff]' : 'text-[#8d909a] hover:text-white hover:bg-white/5')} title={icon}>
                            <Icon icon={icon} className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1" />

              {/* Assignee picker */}
              <div className="relative flex items-center gap-1">
                {localAssignees.length > 0 && (
                  <div className="flex -space-x-1.5">
                    {localAssignees.map((a, i) => (
                      <img key={i} src={a.avatar} alt={a.name} className="w-7 h-7 rounded-full border-2 border-[#0d0d0d] object-cover" title={a.name} />
                    ))}
                  </div>
                )}
                <button onClick={() => setShowAssigneePicker(v => !v)} className="w-7 h-7 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/40 hover:border-white/60 hover:text-white/70 transition-colors" title="Gerenciar membros">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {showAssigneePicker && (
                  <div className="absolute top-9 right-0 z-20 bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl shadow-2xl p-3 w-52">
                    <p className="text-[10px] text-[#8d909a] uppercase tracking-wider mb-2">Membros</p>
                    <div className="flex flex-col gap-1">
                      {availableMembers.map(name => {
                        const assigned = localAssignees.some(a => a.name === name);
                        return (
                          <button key={name} onClick={() => handleToggleAssignee(name)} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left", assigned ? "bg-[#b7c4ff]/10 text-[#b7c4ff]" : "text-[#e5e2e1] hover:bg-[#2a2a2a]")}>
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

              <button onClick={handleCompleteTask} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#81c784]/10 text-[#81c784] hover:bg-[#81c784]/20 text-xs font-semibold transition-colors border border-[#81c784]/20 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluir
              </button>
            </div>
          </div>

          {/* ─── Body: Left tabs + Right chat ─── */}
          <div className="flex-1 flex overflow-hidden min-h-0">

            {/* Left: tab bar + content */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#2a2a2a]">
              <div className="flex-shrink-0 flex gap-1 p-1 bg-[#1c1c1c] border-b border-white/5">
                {TASK_TABS.map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors', activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70')}>
                      <TabIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-hidden min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="h-full overflow-y-auto">

                    {/* ── Overview ── */}
                    {activeTab === 'overview' && (
                      <div className="p-5 flex flex-col gap-4">
                        <div className="bg-[#171717] border border-[#2a2a2a] rounded-xl p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <DesignSpecField label="Direção Criativa" value={task.designSpecs?.creativeDirection || ''} placeholder="Ex: Seguir briefing" onSave={v => updateTask(task.id, { designSpecs: { ...task.designSpecs, creativeDirection: v } })} />
                            <DesignSpecField label="Tamanhos Necessários" value={task.designSpecs?.sizes || ''} placeholder="Ex: 2000x2000" onSave={v => updateTask(task.id, { designSpecs: { ...task.designSpecs, sizes: v } })} />
                            <DesignSpecField label="Tipos de Arquivo" value={task.designSpecs?.fileTypes || ''} placeholder="Ex: jpg, png" onSave={v => updateTask(task.id, { designSpecs: { ...task.designSpecs, fileTypes: v } })} />
                          </div>
                        </div>
                        <CollapsibleSection title="Descrição" icon={AlignLeft} action={<button className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">Editar</button>}>
                          <textarea className="w-full h-32 bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 text-sm text-[#8d909a] focus:outline-none focus:border-[#b7c4ff]/50 resize-none" placeholder="Adicione uma descrição mais detalhada..." defaultValue={task.description || ''} onBlur={e => { if (e.target.value !== (task.description || '')) updateTask(task.id, { description: e.target.value }); }} />
                        </CollapsibleSection>
                        <CollapsibleSection title="Texto do Design" icon={Type} action={<button className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">Editar</button>}>
                          <textarea className="w-full h-24 bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 text-sm text-[#8d909a] focus:outline-none focus:border-[#b7c4ff]/50 resize-none" placeholder="Adicione o texto/copy que deve ir na arte..." />
                        </CollapsibleSection>
                        <div className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-[#8d909a]" />
                            <h3 className="text-sm font-semibold text-[#e5e2e1]">Prioridade Interna</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-[#8d909a] uppercase tracking-wider">equipe</span>
                          </div>
                          <p className="text-[11px] text-[#8d909a]">Visível apenas para a equipe interna.</p>
                          <select value={task.internalPriority || ''} onChange={e => updateTask(task.id, { internalPriority: e.target.value || undefined })} className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50">
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
                    {activeTab === 'checklist' && (
                      <div className="p-5 flex flex-col gap-4">
                        <CollapsibleSection
                          title={`Checklist${(task.checklist?.length ?? 0) > 0 ? ` (${task.checklist!.filter(i => i.done).length}/${task.checklist!.length})` : ''}`}
                          icon={ListChecks}
                          forceOpen={activeStrip === 'checklist'}
                          action={<button onClick={e => { e.stopPropagation(); handleAddChecklistItem(); }} className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">+ Item</button>}
                        >
                          <div className="flex flex-col gap-2">
                            {(task.checklist || []).map(item => (
                              <div key={item.id} className="flex items-center gap-2 group/ci">
                                <button onClick={() => handleToggleChecklistItem(item.id)} className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors", item.done ? "bg-[#81c784] border-[#81c784]" : "border-[#555] hover:border-[#b7c4ff]")}>
                                  {item.done && <Check className="w-3 h-3 text-black" />}
                                </button>
                                <span className={cn("flex-1 text-sm", item.done ? "line-through text-[#555]" : "text-[#e5e2e1]")}>{item.text}</span>
                                <button onClick={() => handleDeleteChecklistItem(item.id)} className="opacity-0 group-hover/ci:opacity-100 text-[#8d909a] hover:text-[#ffb4ab] transition-all"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 mt-1">
                              <input value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()} placeholder="Novo item..." className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 placeholder:text-[#555]" />
                              <button onClick={handleAddChecklistItem} className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">+</button>
                            </div>
                          </div>
                        </CollapsibleSection>
                        <CollapsibleSection
                          title={`Sub-tarefas${(task.subTaskIds?.length ?? 0) > 0 ? ` (${task.subTaskIds!.length})` : ''}`}
                          icon={Link2}
                          forceOpen={activeStrip === 'subtask'}
                          action={<button onClick={e => { e.stopPropagation(); setShowSubTaskPicker(v => !v); setSubTaskSearch(''); }} className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">+ Vincular</button>}
                        >
                          <div className="flex flex-col gap-2">
                            {showSubTaskPicker && (
                              <div className="mb-2">
                                <div className="relative mb-2">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                                  <input autoFocus value={subTaskSearch} onChange={e => setSubTaskSearch(e.target.value)} placeholder="Buscar tarefa..." className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg pl-8 pr-3 py-1.5 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 placeholder:text-[#555]" />
                                </div>
                                {linkableTasks.length === 0 ? (
                                  <p className="text-xs text-[#555] text-center py-1">Nenhuma tarefa encontrada</p>
                                ) : (
                                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                                    {linkableTasks.slice(0, 8).map(t => {
                                      const linked = (task.subTaskIds || []).includes(t.id);
                                      const cfg = priorityConfig[t.priority as Priority] || priorityConfig['Média'];
                                      return (
                                        <button key={t.id} onClick={() => handleToggleSubTask(t.id)} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors", linked ? "bg-[#b7c4ff]/10 text-[#b7c4ff]" : "text-[#e5e2e1] hover:bg-[#2a2a2a]")}>
                                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", cfg.bg, cfg.color, cfg.border)}>{t.priority.slice(0, 1)}</span>
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
                                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0", cfg.bg, cfg.color, cfg.border)}>{linked.priority.slice(0, 1)}</span>
                                  <span className="flex-1 text-sm text-[#e5e2e1] truncate">{linked.title}</span>
                                  <span className="text-[10px] text-[#8d909a] shrink-0">{statusLabel[linked.status] || linked.status}</span>
                                  <button onClick={() => handleToggleSubTask(id)} className="opacity-0 group-hover/st:opacity-100 text-[#8d909a] hover:text-[#ffb4ab] transition-all ml-1"><X className="w-3.5 h-3.5" /></button>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="Equipe Técnica" icon={Terminal} action={<button className="px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors">Editar</button>}>
                          <textarea className="w-full h-24 bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 text-sm text-[#8d909a] focus:outline-none focus:border-[#b7c4ff]/50 resize-none font-mono" placeholder="Notas para desenvolvedores, links de repositório, etc..." />
                        </CollapsibleSection>
                      </div>
                    )}

                    {/* ── Assets ── */}
                    {activeTab === 'assets' && (
                      <div className="p-5 flex flex-col gap-4">
                        <CollapsibleSection title={`Anexos (${attachments.length})`} icon={Paperclip}
                          action={
                            <div className="relative">
                              <input type="file" id="file-upload-detail" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={() => toast.info('Upload de anexos disponível após integração com backend.')} disabled={isUploading} />
                              <label htmlFor="file-upload-detail" className={cn("px-3 py-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-xs font-medium text-[#e5e2e1] transition-colors flex items-center gap-1 cursor-pointer", isUploading && "opacity-50 cursor-not-allowed")}>
                                <Plus className="w-3 h-3" /> {isUploading ? `${Math.round(uploadProgress)}%` : 'Adicionar'}
                              </label>
                            </div>
                          }
                        >
                          <div className="flex flex-col gap-3">
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
                                    {brandHub.colors.map((color: any) => (
                                      <button key={color.id} onClick={() => { navigator.clipboard.writeText(color.hex); toast.success(`Copiado: ${color.hex}`); }} className="flex items-center gap-2 bg-[#131313] border border-[#2a2a2a] rounded-lg px-2 py-1.5 hover:border-[#b7c4ff]/50 transition-colors">
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
                                    {brandHub.fonts.map((font: any) => (
                                      <div key={font.id} className="flex items-center justify-between bg-[#131313] border border-[#2a2a2a] rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-[#e5e2e1]">{font.name}</span>
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#8d909a] uppercase tracking-wider">{font.type}</span>
                                        </div>
                                        {font.type === 'google' && font.googleFontName && <a href={`https://fonts.google.com/download?family=${encodeURIComponent(font.googleFontName)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#b7c4ff] hover:underline">Download</a>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <Link to={`/brand-hub/${brandHub.id}`} className="inline-flex items-center gap-1.5 text-xs text-[#b7c4ff] hover:underline">
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

            {/* Right: Chat */}
            <div className="w-[360px] flex flex-col flex-shrink-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {messages.map(msg => {
                  const isCurrentUser = msg.senderId === MOCK_USER.uid;
                  return (
                    <div key={msg.id} className={cn("flex gap-3", isCurrentUser ? "flex-row-reverse" : "")}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", isCurrentUser ? "bg-[#b7c4ff] text-[#002682]" : "bg-[#2a2a2a] text-[#e5e2e1]")}>{msg.sender}</div>
                      <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
                        <div className={cn("flex items-baseline gap-2 mb-1", isCurrentUser ? "flex-row-reverse" : "")}>
                          <span className="text-sm font-medium text-[#e5e2e1]">{msg.senderName}</span>
                          <span className="text-[10px] text-[#8d909a]">{msg.time}</span>
                        </div>
                        <div className={cn("border rounded-2xl p-3 text-sm max-w-[360px] relative group", isCurrentUser ? "bg-[#b7c4ff]/10 border-[#b7c4ff]/20 text-[#b7c4ff] rounded-tr-none" : "bg-[#1c1c1c] border-[#2a2a2a] text-[#8d909a] rounded-tl-none")}>
                          {isCurrentUser && (
                            <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#131313] border border-[#2a2a2a] rounded-lg p-1 shadow-lg z-10">
                              <button onClick={() => startEditingComment(msg)} className="p-1 text-[#8d909a] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => deleteComment(msg.id)} className="p-1 text-[#8d909a] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          )}
                          {editingCommentId === msg.id ? (
                            <div className="flex flex-col gap-2">
                              <textarea autoFocus value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 resize-none min-h-[60px]" />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingCommentId(null)} className="px-2 py-1 rounded-lg text-xs text-[#8d909a] hover:bg-[#2a2a2a] transition-colors">Cancelar</button>
                                <button onClick={() => saveEditComment(msg.id)} className="px-2 py-1 rounded-lg text-xs bg-[#b7c4ff] text-[#002682] hover:bg-[#b7c4ff]/90 transition-colors">Salvar</button>
                              </div>
                            </div>
                          ) : msg.image ? (
                            <div>
                              {msg.text && <p className="mb-2">{msg.text}</p>}
                              <img
                                src={msg.image} alt="Imagem enviada" className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setFeedbackImage(msg.image!)}
                              />
                              <button onClick={() => setFeedbackImage(msg.image!)} className="mt-1.5 text-[10px] text-[#b7c4ff] hover:underline flex items-center gap-1">
                                <MousePointerClick className="w-3 h-3" /> Abrir para feedback visual
                              </button>
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat input */}
              <div className="p-4 border-t border-[#2a2a2a] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input type="file" accept="image/*" id="image-upload-detail" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleSendImage} disabled={isUploading} />
                    <label htmlFor="image-upload-detail" className={cn("flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border border-[#2a2a2a] transition-colors cursor-pointer", isUploading ? "bg-[#2a2a2a] text-[#555]" : "bg-[#131313] text-[#8d909a] hover:text-[#e5e2e1] hover:border-[#333]")}>
                      Imagem
                    </label>
                  </div>
                  <div className="relative flex-1">
                    <input ref={chatInputRef} type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Digite sua mensagem..." className="w-full bg-[#131313] border border-[#2a2a2a] rounded-xl py-3 pl-4 pr-12 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#b7c4ff]/50 transition-colors placeholder:text-[#8d909a]" />
                    <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#b7c4ff] hover:bg-[#b7c4ff]/10 transition-colors"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Feedback Modal (managed internally) */}
      {feedbackImage && (
        <VisualFeedbackModal taskId={task.id} imageUrl={feedbackImage} onClose={() => setFeedbackImage(null)} />
      )}
    </>
  );
}
