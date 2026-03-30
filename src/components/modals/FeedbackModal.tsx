import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { useStore } from '../../store';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

export function FeedbackModal({ isOpen, onClose, clientId, clientName }: FeedbackModalProps) {
  const { t } = useTranslation();
  const feedbacks = useStore((s) => s.feedbacks);
  const addFeedback = useStore((s) => s.addFeedback);
  const updateFeedback = useStore((s) => s.updateFeedback);
  const session = useStore((s) => s.session);

  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const [month, setMonth] = useState(currentMonth);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [note, setNote] = useState('');

  // Check if feedback already exists for this client+month
  const existing = feedbacks.find(f => f.clientId === clientId && f.month === month);

  useEffect(() => {
    if (existing) {
      setRating(existing.rating);
      setNote(existing.note || '');
    } else {
      setRating(0);
      setNote('');
    }
  }, [existing?.id, month]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Selecione uma avaliação de 1 a 5 estrelas.');
      return;
    }
    try {
      if (existing) {
        await updateFeedback(existing.id, { rating, note, month });
      } else {
        await addFeedback({
          clientId,
          rating,
          month,
          note,
          createdBy: session?.name || 'admin',
        });
      }
      toast.success(t('feedback.saved'));
      onClose();
    } catch {
      toast.error(t('feedback.errorSave'));
    }
  };

  const displayRating = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <div>
            <h2 className="text-xl font-headline font-semibold text-on-surface">
              {existing ? t('feedback.editTitle') : t('feedback.title')}
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{clientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">{t('feedback.monthLabel')}</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              max={currentMonth}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface"
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">{t('feedback.ratingLabel')}</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= displayRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-on-surface-variant/30'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-on-surface-variant">
                {displayRating > 0 ? `${displayRating}/5` : '—'}
              </span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              {t('feedback.noteLabel')} <span className="text-on-surface-variant font-normal">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface min-h-[80px] resize-none"
              placeholder={t('feedback.notePlaceholder')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded-xl font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              {t('feedback.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
