import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../Modal';
import { useStore } from '../../store';
import { toast } from 'sonner';
import { extractBrandFromUrl } from '../../lib/utils';
import { BrandSuggestionModal } from './BrandSuggestionModal';
import { useTranslation } from 'react-i18next';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewClientModal({ isOpen, onClose }: NewClientModalProps) {
  const { t } = useTranslation();
  const addClient = useStore((state) => state.addClient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestedBrand, setSuggestedBrand] = useState<{logo: string, colors: string[]} | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'Ativo' as const,
    logo: '',
    contact: '',
    email: '',
    phone: '',
    website: '',
    maxActiveTasks: 2,
  });

  const handleWebsiteBlur = async () => {
    if (!formData.website || formData.logo) return;

    setIsExtracting(true);
    try {
      const brandData = await extractBrandFromUrl(formData.website);
      if (brandData) {
        setSuggestedBrand(brandData);
        setShowBrandModal(true);
      }
    } catch (error) {
      console.error('Error extracting brand:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAcceptBrand = () => {
    if (suggestedBrand) {
      setFormData(prev => ({
        ...prev,
        logo: suggestedBrand.logo
      }));
    }
    setShowBrandModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      addClient({
        ...formData,
        logo: formData.logo || formData.name.charAt(0).toUpperCase() || 'C',
        createdAt: new Date().toISOString(),
      });
      onClose();
      setFormData({ name: '', industry: '', status: 'Ativo', logo: '', contact: '', email: '', phone: '', website: '', maxActiveTasks: 2 });
      toast.success(t('clients.added'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('clients.new')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">{t('clients.companyName')}</label>
            <input
              required
              type="text"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
              placeholder={t('clients.companyNamePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">{t('clients.website')}</label>
            <div className="flex gap-2 relative">
              <input
                type="url"
                className="flex-1 bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface pr-10"
                placeholder={t('clients.websitePlaceholder')}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                onBlur={handleWebsiteBlur}
              />
              {isExtracting && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">{t('common.optional')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">{t('clients.industry')}</label>
              <input
                required
                type="text"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                placeholder={t('clients.industryPlaceholder')}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">{t('clients.maxTasks')}</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                placeholder="2"
                value={formData.maxActiveTasks}
                onChange={(e) => setFormData({ ...formData, maxActiveTasks: parseInt(e.target.value) || 2 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">{t('clients.contact')}</label>
            <input
              required
              type="text"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
              placeholder={t('clients.contactPlaceholder')}
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">{t('clients.email')}</label>
              <input
                required
                type="email"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                placeholder={t('clients.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">{t('clients.phone')}</label>
              <input
                required
                type="tel"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                placeholder={t('clients.phonePlaceholder')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
            >
              {t('clients.addClient')}
            </button>
          </div>
        </form>
      </Modal>

      <BrandSuggestionModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onAccept={handleAcceptBrand}
        brandData={suggestedBrand}
        clientName={formData.name || 'Cliente'}
      />
    </>
  );
}
