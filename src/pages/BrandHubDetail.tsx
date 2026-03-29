import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, type BrandColor, type BrandFont, type BrandKeyword, type BrandLogo, type BrandSocialLinks } from '../store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Pencil, Trash2, ExternalLink, Download,
  Plus, X, Check, Upload, Globe, ChevronDown,
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { formatRgb, formatCmyk } from '../lib/colorUtils';
import { uploadFile } from '../lib/storageUtils';

// ─── Color swatch with inline edit ────────────────────────────────────────────

function ColorSection({ hubId, colors }: { hubId: string; colors: BrandColor[] }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BrandColor[]>(colors);

  useEffect(() => { setDraft(colors); }, [colors]);

  const save = () => {
    updateBrandHub(hubId, { colors: draft });
    setEditing(false);
    toast.success('Cores atualizadas');
  };

  const addColor = () =>
    setDraft((d) => [...d, { id: crypto.randomUUID(), name: 'Nova Cor', hex: '#000000' }]);

  const remove = (id: string) => setDraft((d) => d.filter((c) => c.id !== id));

  const update = (id: string, field: keyof BrandColor, value: string) =>
    setDraft((d) => d.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  return (
    <Section
      title="Cores"
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft(colors); setEditing(false); }}
    >
      {editing ? (
        <div className="space-y-3">
          {draft.map((color) => (
            <div key={color.id} className="flex items-center gap-3">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => update(color.id, 'hex', e.target.value)}
                className="w-10 h-10 rounded-lg border border-surface-container-high cursor-pointer"
              />
              <input
                value={color.name}
                onChange={(e) => update(color.id, 'name', e.target.value)}
                placeholder="Nome"
                className="flex-1 px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
              <input
                value={color.purpose ?? ''}
                onChange={(e) => update(color.id, 'purpose', e.target.value)}
                placeholder="Propósito (opcional)"
                className="flex-[2] px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={() => remove(color.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addColor} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-1">
            <Plus className="w-4 h-4" /> Adicionar cor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colors.map((color) => (
            <ColorSwatch key={color.id} color={color} />
          ))}
          {colors.length === 0 && <EmptyHint>Nenhuma cor cadastrada ainda.</EmptyHint>}
        </div>
      )}
    </Section>
  );
}

function ColorSwatch({ color }: { color: BrandColor }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      className="flex items-center gap-4 p-3 bg-surface-container-low border border-surface-container-high rounded-xl"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="w-12 h-12 rounded-lg border border-white/10 flex-shrink-0 relative" style={{ background: color.hex }}>
        {showTooltip && (
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-10 bg-surface-container-highest border border-surface-container-high rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap">
            <div className="text-on-surface font-mono">{color.hex.toUpperCase()}</div>
            <div className="text-on-surface-variant">{formatRgb(color.hex)}</div>
            <div className="text-on-surface-variant">{formatCmyk(color.hex)}</div>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-on-surface">{color.name}</p>
        <p className="text-xs text-on-surface-variant font-mono">{color.hex.toUpperCase()}</p>
        {color.purpose && <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{color.purpose}</p>}
      </div>
    </div>
  );
}

// ─── Logos ───────────────────────────────────────────────────────────────────

function LogosSection({ hubId, logos }: { hubId: string; logos: BrandLogo[] }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, `brandhubs/${hubId}/logos/${file.name}`);
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const newLogo: BrandLogo = { id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), url, format: ext };
      await updateBrandHub(hubId, { logos: [...logos, newLogo] });
      toast.success('Logo enviado com sucesso!');
    } catch {
      toast.error('Erro ao enviar logo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeLogo = async (id: string) => {
    await updateBrandHub(hubId, { logos: logos.filter((l) => l.id !== id) });
  };

  return (
    <Section title="Logos" editing={false} onEdit={() => {}} onSave={() => {}} onCancel={() => {}} hideEditButton>
      <div className="space-y-3">
        {logos.map((logo) => (
          <div key={logo.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-surface-container-high overflow-hidden">
              <img src={logo.url} alt={logo.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">{logo.name}</p>
              {logo.format && <p className="text-xs text-on-surface-variant uppercase">{logo.format}</p>}
            </div>
            <a href={logo.url} download target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
              <Download className="w-4 h-4" />
            </a>
            <button onClick={() => removeLogo(logo.id)} className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {logos.length === 0 && <EmptyHint>Nenhum logo enviado ainda.</EmptyHint>}
        <label className={`flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer w-fit ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input type="file" accept="image/*,.svg" className="hidden" onChange={handleUpload} />
          <Upload className="w-4 h-4" />
          {uploading ? 'Enviando...' : 'Enviar logo'}
        </label>
      </div>
    </Section>
  );
}

// ─── Fonts ────────────────────────────────────────────────────────────────────

function FontsSection({ hubId, fonts }: { hubId: string; fonts: BrandFont[] }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BrandFont[]>(fonts);
  const [newFont, setNewFont] = useState({ name: '', type: 'google' as BrandFont['type'], googleFontName: '', fileUrl: '', linkUrl: '' });

  useEffect(() => { setDraft(fonts); }, [fonts]);

  const save = () => {
    updateBrandHub(hubId, { fonts: draft });
    setEditing(false);
    toast.success('Fontes atualizadas');
  };

  const addFont = () => {
    if (!newFont.name.trim()) return;
    setDraft((d) => [...d, { ...newFont, id: crypto.randomUUID(), name: newFont.name.trim() }]);
    setNewFont({ name: '', type: 'google', googleFontName: '', fileUrl: '', linkUrl: '' });
  };

  const removeFont = (id: string) => setDraft((d) => d.filter((f) => f.id !== id));

  const downloadUrl = (font: BrandFont): string | null => {
    if (font.type === 'google' && font.googleFontName) return `https://fonts.google.com/download?family=${encodeURIComponent(font.googleFontName)}`;
    if (font.type === 'file' && font.fileUrl) return font.fileUrl;
    if (font.type === 'link' && font.linkUrl) return font.linkUrl;
    return null;
  };

  const TYPE_LABELS: Record<BrandFont['type'], string> = { google: 'Google Fonts', file: 'Arquivo', link: 'Link' };
  const TYPE_COLORS: Record<BrandFont['type'], string> = {
    google: 'bg-blue-500/10 text-blue-400',
    file: 'bg-green-500/10 text-green-400',
    link: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <Section title="Fontes" editing={editing} onEdit={() => setEditing(true)} onSave={save} onCancel={() => { setDraft(fonts); setEditing(false); }}>
      <div className="space-y-3">
        {draft.map((font) => (
          <div key={font.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-surface-container-high rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-on-surface">{font.name}</p>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[font.type]}`}>{TYPE_LABELS[font.type]}</span>
              </div>
              {font.type === 'google' && font.googleFontName && (
                <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{font.googleFontName}</p>
              )}
            </div>
            {(() => {
              const url = downloadUrl(font);
              return url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" download={font.type === 'file'}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
                  <Download className="w-4 h-4" />
                </a>
              ) : null;
            })()}
            {editing && (
              <button onClick={() => removeFont(font.id)} className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {fonts.length === 0 && !editing && <EmptyHint>Nenhuma fonte cadastrada ainda.</EmptyHint>}
        {editing && (
          <div className="mt-3 p-3 bg-surface-container-low border border-dashed border-surface-container-high rounded-xl space-y-2">
            <p className="text-xs text-on-surface-variant font-medium">Nova fonte</p>
            <div className="flex gap-2">
              <input
                value={newFont.name}
                onChange={(e) => setNewFont((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome (ex: Inter)"
                className="flex-1 px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={newFont.type}
                onChange={(e) => setNewFont((f) => ({ ...f, type: e.target.value as BrandFont['type'] }))}
                className="px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              >
                <option value="google">Google Fonts</option>
                <option value="file">Arquivo</option>
                <option value="link">Link</option>
              </select>
            </div>
            {newFont.type === 'google' && (
              <input
                value={newFont.googleFontName}
                onChange={(e) => setNewFont((f) => ({ ...f, googleFontName: e.target.value }))}
                placeholder="Nome exato no Google Fonts (ex: Playfair Display)"
                className="w-full px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
            )}
            {newFont.type === 'link' && (
              <input
                value={newFont.linkUrl}
                onChange={(e) => setNewFont((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="URL de download"
                className="w-full px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
            )}
            <button onClick={addFont} disabled={!newFont.name.trim()} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-40">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Keywords ────────────────────────────────────────────────────────────────

const MAX_KEYWORDS = 10;
const MAX_PRIMARY = 3;

function KeywordsSection({ hubId, keywords }: { hubId: string; keywords: BrandKeyword[] }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [input, setInput] = useState('');

  const addKeyword = () => {
    const word = input.trim();
    if (!word || keywords.length >= MAX_KEYWORDS) return;
    if (keywords.some((k) => k.word.toLowerCase() === word.toLowerCase())) return;
    updateBrandHub(hubId, { keywords: [...keywords, { id: crypto.randomUUID(), word, isPrimary: false }] });
    setInput('');
  };

  const togglePrimary = (id: string) => {
    const kw = keywords.find((k) => k.id === id);
    if (!kw) return;
    const primaryCount = keywords.filter((k) => k.isPrimary).length;
    if (!kw.isPrimary && primaryCount >= MAX_PRIMARY) {
      toast.error(`Máximo de ${MAX_PRIMARY} palavras-chave primárias.`);
      return;
    }
    updateBrandHub(hubId, { keywords: keywords.map((k) => k.id === id ? { ...k, isPrimary: !k.isPrimary } : k) });
  };

  const removeKeyword = (id: string) =>
    updateBrandHub(hubId, { keywords: keywords.filter((k) => k.id !== id) });

  return (
    <Section title="Palavras-chave" editing={false} onEdit={() => {}} onSave={() => {}} onCancel={() => {}} hideEditButton>
      <div className="space-y-4">
        <p className="text-xs text-on-surface-variant">{keywords.length}/{MAX_KEYWORDS} — clique para definir como primária (máx. {MAX_PRIMARY})</p>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <div key={kw.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${kw.isPrimary ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface border-surface-container-high hover:border-primary/50'}`}>
              <button onClick={() => togglePrimary(kw.id)} className="focus:outline-none">
                {kw.word}
              </button>
              <button onClick={() => removeKeyword(kw.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {keywords.length === 0 && <EmptyHint>Nenhuma palavra-chave ainda.</EmptyHint>}
        </div>
        {keywords.length < MAX_KEYWORDS && (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Nova palavra-chave..."
              className="flex-1 px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={addKeyword} disabled={!input.trim()} className="px-3 py-1.5 bg-primary text-on-primary text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Identity ─────────────────────────────────────────────────────────────────

const IDENTITY_FIELDS: { key: keyof BrandHub['identity']; label: string; multiline?: boolean }[] = [
  { key: 'nicho', label: 'Nicho / Segmento' },
  { key: 'publicoAlvo', label: 'Público-alvo', multiline: true },
  { key: 'tomDeVoz', label: 'Tom de Voz', multiline: true },
  { key: 'slogan', label: 'Slogan' },
  { key: 'proposta', label: 'Proposta de Valor', multiline: true },
  { key: 'objetivo', label: 'Objetivo da Marca', multiline: true },
  { key: 'concorrentes', label: 'Concorrentes' },
  { key: 'restricoesVisuais', label: 'Restrições Visuais', multiline: true },
];

type BrandHubIdentity = BrandHub['identity'];
import type { BrandHub } from '../store';

function IdentitySection({ hubId, identity }: { hubId: string; identity: BrandHubIdentity }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BrandHubIdentity>({ ...identity });

  useEffect(() => { setDraft({ ...identity }); }, [identity]);

  const save = () => {
    updateBrandHub(hubId, { identity: draft });
    setEditing(false);
    toast.success('Identidade atualizada');
  };

  return (
    <Section title="Identidade da Marca" editing={editing} onEdit={() => setEditing(true)} onSave={save} onCancel={() => { setDraft({ ...identity }); setEditing(false); }}>
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IDENTITY_FIELDS.map(({ key, label, multiline }) => (
            <div key={key} className={multiline ? 'sm:col-span-2' : ''}>
              <label className="block text-xs text-on-surface-variant mb-1">{label}</label>
              {multiline ? (
                <textarea
                  value={draft[key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary resize-none"
                />
              ) : (
                <input
                  value={draft[key] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IDENTITY_FIELDS.map(({ key, label }) => {
            const val = identity[key];
            if (!val) return null;
            return (
              <div key={key} className={key === 'tomDeVoz' || key === 'publicoAlvo' || key === 'proposta' || key === 'objetivo' || key === 'restricoesVisuais' ? 'sm:col-span-2' : ''}>
                <dt className="text-xs text-on-surface-variant mb-0.5">{label}</dt>
                <dd className="text-sm text-on-surface">{val}</dd>
              </div>
            );
          })}
          {IDENTITY_FIELDS.every(({ key }) => !identity[key]) && <EmptyHint className="sm:col-span-2">Nenhuma informação de identidade ainda.</EmptyHint>}
        </dl>
      )}
    </Section>
  );
}

// ─── Figma + Website ──────────────────────────────────────────────────────────

function LinksSection({ hubId, figmaLink, websiteUrl }: { hubId: string; figmaLink: string; websiteUrl?: string }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [editing, setEditing] = useState(false);
  const [figma, setFigma] = useState(figmaLink);
  const [website, setWebsite] = useState(websiteUrl ?? '');

  const save = () => {
    updateBrandHub(hubId, { figmaLink: figma, websiteUrl: website });
    setEditing(false);
    toast.success('Links atualizados');
  };

  return (
    <Section title="Links" editing={editing} onEdit={() => setEditing(true)} onSave={save} onCancel={() => { setFigma(figmaLink); setWebsite(websiteUrl ?? ''); setEditing(false); }}>
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Figma</label>
            <input value={figma} onChange={(e) => setFigma(e.target.value)} placeholder="https://figma.com/file/..." className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs text-on-surface-variant mb-1">Site</label>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {figmaLink ? (
            <a href={figmaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-sm text-on-surface hover:border-primary/50 transition-colors">
              <ExternalLink className="w-4 h-4 text-on-surface-variant" /> Abrir no Figma
            </a>
          ) : null}
          {websiteUrl ? (
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-sm text-on-surface hover:border-primary/50 transition-colors">
              <Globe className="w-4 h-4 text-on-surface-variant" /> Site da Marca
            </a>
          ) : null}
          {!figmaLink && !websiteUrl && <EmptyHint>Nenhum link cadastrado.</EmptyHint>}
        </div>
      )}
    </Section>
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────

const SOCIAL_FIELDS: { key: keyof BrandSocialLinks; label: string; icon: string; color: string }[] = [
  { key: 'instagram', label: 'Instagram', icon: 'mdi:instagram', color: '#E1306C' },
  { key: 'tiktok', label: 'TikTok', icon: 'ic:baseline-tiktok', color: '#010101' },
  { key: 'youtube', label: 'YouTube', icon: 'mdi:youtube', color: '#FF0000' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'mdi:linkedin', color: '#0A66C2' },
  { key: 'twitter', label: 'X / Twitter', icon: 'ri:twitter-x-fill', color: '#000000' },
  { key: 'facebook', label: 'Facebook', icon: 'mdi:facebook', color: '#1877F2' },
  { key: 'pinterest', label: 'Pinterest', icon: 'mdi:pinterest', color: '#E60023' },
  { key: 'behance', label: 'Behance', icon: 'mdi:behance', color: '#1769FF' },
  { key: 'dribbble', label: 'Dribbble', icon: 'mdi:dribbble', color: '#EA4C89' },
];

function SocialLinksSection({ hubId, socialLinks }: { hubId: string; socialLinks?: BrandSocialLinks }) {
  const updateBrandHub = useStore((s) => s.updateBrandHub);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BrandSocialLinks>(socialLinks ?? {});

  useEffect(() => { setDraft(socialLinks ?? {}); }, [socialLinks]);

  const save = () => {
    updateBrandHub(hubId, { socialLinks: draft });
    setEditing(false);
    toast.success('Redes sociais atualizadas');
  };

  const activeLinks = SOCIAL_FIELDS.filter((f) => socialLinks?.[f.key]);

  return (
    <Section
      title="Redes Sociais"
      editing={editing}
      onEdit={() => setEditing(true)}
      onSave={save}
      onCancel={() => { setDraft(socialLinks ?? {}); setEditing(false); }}
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(({ key, label, icon, color }) => (
            <div key={key}>
              <label className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
                <Icon icon={icon} width={14} style={{ color }} />
                {label}
              </label>
              <input
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value || undefined }))}
                placeholder={`https://...`}
                className="w-full px-3 py-1.5 bg-surface-variant rounded-lg text-sm text-on-surface border-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {activeLinks.map(({ key, label, icon, color }) => (
            <a
              key={key}
              href={socialLinks![key]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-sm text-on-surface hover:border-primary/50 transition-colors"
            >
              <Icon icon={icon} width={18} style={{ color }} />
              {label}
            </a>
          ))}
          {activeLinks.length === 0 && <EmptyHint>Nenhuma rede social cadastrada.</EmptyHint>}
        </div>
      )}
    </Section>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Section({
  title, children, editing, onEdit, onSave, onCancel, hideEditButton, defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  hideEditButton?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface-container-low border border-surface-container-high rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 focus:outline-none"
        >
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          <ChevronDown
            className="w-4 h-4 text-on-surface-variant transition-transform duration-200 flex-shrink-0"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        {open && !hideEditButton && !editing && (
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors ml-2 flex-shrink-0">
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {open && editing && (
          <div className="flex gap-2 ml-2 flex-shrink-0">
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="w-4 h-4" />
            </button>
            <button onClick={onSave} className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-on-surface-variant/60 italic ${className ?? ''}`}>{children}</p>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function BrandHubDetail() {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const brandhubs = useStore((s) => s.brandhubs);
  const deleteBrandHub = useStore((s) => s.deleteBrandHub);
  const updateBrandHub = useStore((s) => s.updateBrandHub);

  const hub = brandhubs.find((h) => h.id === hubId);

  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState({ brandName: '', brandType: '' });

  useEffect(() => {
    if (hub) setHeaderDraft({ brandName: hub.brandName, brandType: hub.brandType ?? '' });
  }, [hub]);

  if (!hub) {
    return (
      <div className="max-w-7xl mx-auto py-24 flex flex-col items-center gap-4 text-on-surface-variant">
        <p>Brand Hub não encontrado.</p>
        <button onClick={() => navigate('/brand-hub')} className="text-primary hover:underline text-sm">← Voltar</button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm(`Excluir "${hub.brandName}"? Esta ação não pode ser desfeita.`)) return;
    await deleteBrandHub(hub.id);
    toast.success('Brand Hub excluído.');
    navigate('/brand-hub');
  };

  const saveHeader = () => {
    updateBrandHub(hub.id, { brandName: headerDraft.brandName, brandType: headerDraft.brandType || undefined });
    setEditingHeader(false);
    toast.success('Nome atualizado');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back */}
      <button
        onClick={() => navigate('/brand-hub')}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #19191B 0%, #13345F 100%)' }}
      >
        <div className="p-8 flex items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            {hub.logos[0] && (
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={hub.logos[0].url} alt={hub.brandName} className="w-10 h-10 object-contain" />
              </div>
            )}
            {editingHeader ? (
              <div className="space-y-2">
                <input
                  value={headerDraft.brandName}
                  onChange={(e) => setHeaderDraft((d) => ({ ...d, brandName: e.target.value }))}
                  className="bg-white/10 text-white text-2xl font-bold rounded-lg px-3 py-1 border border-white/20 w-full focus:outline-none focus:ring-1 focus:ring-white/40"
                />
                <input
                  value={headerDraft.brandType}
                  onChange={(e) => setHeaderDraft((d) => ({ ...d, brandType: e.target.value }))}
                  placeholder="Tipo da marca"
                  className="bg-white/10 text-white/70 text-sm rounded-lg px-3 py-1 border border-white/20 w-full focus:outline-none focus:ring-1 focus:ring-white/40"
                />
                <div className="flex gap-2">
                  <button onClick={saveHeader} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingHeader(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-white text-2xl font-bold leading-tight">{hub.brandName}</h1>
                {hub.brandType && <p className="text-white/60 text-sm mt-0.5">{hub.brandType}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!editingHeader && (
              <button onClick={() => setEditingHeader(true)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleDelete} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-5">
        <ColorSection hubId={hub.id} colors={hub.colors} />
        <LogosSection hubId={hub.id} logos={hub.logos} />
        <FontsSection hubId={hub.id} fonts={hub.fonts} />
        <KeywordsSection hubId={hub.id} keywords={hub.keywords} />
        <IdentitySection hubId={hub.id} identity={hub.identity} />
        <SocialLinksSection hubId={hub.id} socialLinks={hub.socialLinks} />
        <LinksSection hubId={hub.id} figmaLink={hub.figmaLink} websiteUrl={hub.websiteUrl} />
      </motion.div>
    </div>
  );
}
