import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../Modal';
import { useStore, Client } from '../../store';
import { extractBrandFromUrl } from '../../lib/utils';
import { BrandSuggestionModal } from './BrandSuggestionModal';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export function EditClientModal({ isOpen, onClose, client }: EditClientModalProps) {
  const updateClient = useStore((state) => state.updateClient);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [suggestedBrand, setSuggestedBrand] = useState<{logo: string, colors: string[]} | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);

  const [formData, setFormData] = useState({
    name: client.name,
    industry: client.industry,
    status: client.status,
    contact: client.contact,
    email: client.email || '',
    phone: client.phone || '',
    website: client.website || '',
    maxActiveTasks: client.maxActiveTasks || 2,
  });

  useEffect(() => {
    setFormData({
      name: client.name,
      industry: client.industry,
      status: client.status,
      contact: client.contact,
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      maxActiveTasks: client.maxActiveTasks || 2,
    });
  }, [client]);

  const handleWebsiteBlur = async () => {
    if (!formData.website || client.logo) return;
    
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

  const handleAcceptBrand = async () => {
    if (suggestedBrand) {
      try {
        await updateClient(client.id, {
          logo: suggestedBrand.logo
        });
        toast.success('Logo atualizado com sucesso!');
      } catch (error) {
        console.error('Error updating brand:', error);
        toast.error('Erro ao atualizar logo');
      }
    }
    setShowBrandModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      updateClient(client.id, {
        ...formData,
        logo: formData.name.charAt(0).toUpperCase() || 'C',
      });
      onClose();
      toast.success('Cliente atualizado com sucesso!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Nome da Empresa</label>
            <input
              required
              type="text"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Website + Extract */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Site da Empresa</label>
            <div className="flex gap-2 relative">
              <input
                type="url"
                className="flex-1 bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface pr-10"
                placeholder="https://empresa.com.br"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">Setor / Indústria</label>
              <input
                required
                type="text"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">Máx. Tarefas Simultâneas</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                value={formData.maxActiveTasks}
                onChange={(e) => setFormData({ ...formData, maxActiveTasks: parseInt(e.target.value) || 2 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Contato Principal</label>
            <input
              required
              type="text"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">Email</label>
              <input
                required
                type="email"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">Telefone</label>
              <input
                required
                type="tel"
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Status</label>
            <select
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-on-surface"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' })}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl text-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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
