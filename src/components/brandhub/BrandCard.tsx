import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { BrandHub } from '../../store';

interface Props {
  hub: BrandHub;
}

const MAX_SWATCHES = 4;

export function BrandCard({ hub }: Props) {
  const navigate = useNavigate();
  const extra = hub.colors.length - MAX_SWATCHES;
  const visible = hub.colors.slice(0, MAX_SWATCHES);
  const primaryColor = hub.colors[0]?.hex ?? '#2B4C8C';

  return (
    <button
      onClick={() => navigate(`/app/brand-hub/${hub.id}`)}
      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-[28px]"
    >
      <div
        className="rounded-[28px] border border-white/10 overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(to bottom left, ${primaryColor} 0%, #000000 100%)`,
          aspectRatio: '1 / 1',
        }}
      >
        {/* Top: name + type — right aligned */}
        <div className="px-6 pt-7 pb-0 flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className="text-white text-[clamp(1.25rem,3.5vw,1.75rem)] font-bold leading-tight text-right line-clamp-2">
            {hub.brandName}
          </span>
          {hub.brandType && (
            <span className="text-[#B4B4B4] text-sm text-right leading-snug">{hub.brandType}</span>
          )}
        </div>

        {/* Folder area — fills the rest */}
        <div className="flex-1 px-3 pb-3 pt-4 flex flex-col">
          {hub.moodboardUrl ? (
            /* Moodboard image */
            <div
              className="flex-1 rounded-2xl overflow-hidden flex flex-col justify-end"
              style={{ backgroundImage: `url(${hub.moodboardUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Swatches overlay */}
              <div className="flex justify-end px-4 py-3">
                <div className="flex items-center gap-2">
                  {visible.map((color) => (
                    <div
                      key={color.id}
                      className="w-9 h-9 rounded-xl border border-white/25 flex-shrink-0"
                      style={{ background: color.hex }}
                      title={color.name}
                    />
                  ))}
                  {extra > 0 && (
                    <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">+{extra}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Footer */}
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-white text-lg font-bold drop-shadow">
                  {hub.logos.length} {hub.logos.length === 1 ? 'Logo' : 'Logos'}
                </span>
                <span className="text-white/70 text-sm drop-shadow">
                  {hub.colors.length} {hub.colors.length === 1 ? 'Cor' : 'Cores'} • {hub.fonts.length} {hub.fonts.length === 1 ? 'Fonte' : 'Fontes'}
                </span>
              </div>
            </div>
          ) : (
            /* Folder placeholder — matches the design zip */
            <div className="flex-1 relative flex flex-col">
              {/* Folder tab */}
              <div
                className="absolute top-0 left-0 rounded-tl-[16px] rounded-tr-[16px]"
                style={{ background: '#3D3D3F', width: '44%', height: 30 }}
              />
              {/* Folder body */}
              <div
                className="absolute left-0 right-0 bottom-0 rounded-b-[20px] rounded-tr-[20px] flex flex-col"
                style={{ background: '#2C2C2E', top: 18 }}
              >
                {/* Swatches — top-right of folder body */}
                <div className="flex justify-end px-4 pt-4">
                  <div className="flex items-center gap-2">
                    {visible.map((color) => (
                      <div
                        key={color.id}
                        className="w-9 h-9 rounded-xl border border-white/15 flex-shrink-0"
                        style={{ background: color.hex }}
                        title={color.name}
                      />
                    ))}
                    {extra > 0 && (
                      <div className="w-9 h-9 rounded-xl bg-[#1C1C1E] border border-white/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">+{extra}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer — bottom of folder */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-white text-lg font-bold">
                    {hub.logos.length} {hub.logos.length === 1 ? 'Logo' : 'Logos'}
                  </span>
                  <span className="text-[#A1A1A1] text-sm">
                    {hub.colors.length} {hub.colors.length === 1 ? 'Cor' : 'Cores'} • {hub.fonts.length} {hub.fonts.length === 1 ? 'Fonte' : 'Fontes'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
