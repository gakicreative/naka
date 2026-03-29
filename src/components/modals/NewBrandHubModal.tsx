import React, { useState } from 'react';
import { Modal } from '../Modal';
import { useStore } from '../../store';
import { toast } from 'sonner';
import { extractBrandFromUrl } from '../../lib/utils';
import { Globe, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NewBrandHubModal({ isOpen, onClose }: Props) {
  const clients = useStore((s) => s.clients);
  const upsertBrandHub = useStore((s) => s.upsertBrandHub);
  const session = useStore((s) => s.session);

  const [step, setStep] = useState<1 | 2>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [extractedLogo, setExtractedLogo] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  const [brandName, setBrandName] = useState('');
  const [brandType, setBrandType] = useState('');
  const [clientId, setClientId] = useState('');

  const handleExtract = async () => {
    if (!websiteUrl.trim()) return;
    setIsExtracting(true);
    try {
      let url = websiteUrl.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      const result = await extractBrandFromUrl(url);
      if (result) {
        setBrandName(result.brandName);
        setExtractedLogo(result.logo);
        setExtractedColors(result.colors);
        toast.success('Dados extraídos com sucesso!');
      } else {
        toast.error('Não foi possível extrair dados deste site.');
      }
    } catch {
      toast.error('Erro ao extrair dados do site.');
    } finally {
      setIsExtracting(false);
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setIsSubmitting(true);
    try {
      await upsertBrandHub({
        userId: session?.name ?? '',
        scope: 'client',
        clientId: clientId || undefined,
        brandName: brandName.trim(),
        brandType: brandType.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        moodboardUrl: '',
        colors: extractedColors.map((hex, i) => ({
          id: crypto.randomUUID(),
          name: `Cor ${i + 1}`,
          hex,
        })),
        logos: extractedLogo
          ? [{ id: crypto.randomUUID(), name: 'Logo Principal', url: extractedLogo, format: 'png' }]
          : [],
        fonts: [],
        keywords: [],
        identity: {
          nicho: '',
          publicoAlvo: '',
          tomDeVoz: '',
          slogan: '',
          concorrentes: '',
          restricoesVisuais: '',
        },
        figmaLink: '',
      });
      toast.success('Brand Hub criado com sucesso!');
      handleClose();
    } catch {
      toast.error('Erro ao criar Brand Hub.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setWebsiteUrl('');
    setExtractedLogo(null);
    setExtractedColors([]);
    setBrandName('');
    setBrandType('');
    setClientId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Brand Hub">
      {step === 1 ? (
        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant">
            Digite a URL do site da marca para extrair automaticamente o logo, nome e cores. Você poderá editar tudo depois.
          </p>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              URL do site
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                  placeholder="acmestudio.com"
                  className="w-full pl-9 pr-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting || !websiteUrl.trim()}
                className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isExtracting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Extrair
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => { setStep(2); }}
              className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
            >
              Pular extração
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preview */}
          {(extractedLogo || extractedColors.length > 0) && (
            <div className="flex items-center gap-4 p-3 bg-surface-variant rounded-xl">
              {extractedLogo && (
                <img src={extractedLogo} alt="logo" className="w-10 h-10 rounded-lg object-contain bg-white" />
              )}
              {extractedColors.length > 0 && (
                <div className="flex gap-1.5">
                  {extractedColors.map((hex, i) => (
                    <div key={i} className="w-6 h-6 rounded-md border border-white/20" style={{ background: hex }} title={hex} />
                  ))}
                </div>
              )}
              <span className="text-xs text-on-surface-variant ml-auto">{extractedColors.length} cores extraídas</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Nome da Marca *
            </label>
            <input
              required
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ex: Acme Studio"
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Tipo da Marca
            </label>
            <input
              type="text"
              value={brandType}
              onChange={(e) => setBrandType(e.target.value)}
              placeholder="Ex: Estúdio de Design, E-commerce, SaaS..."
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Vincular ao Cliente
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2 bg-surface-variant border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface text-sm"
            >
              <option value="">Nenhum cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
            >
              Voltar
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !brandName.trim()}
                className="px-6 py-2 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Criando...' : 'Criar Brand Hub'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
