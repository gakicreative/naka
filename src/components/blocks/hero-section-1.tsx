import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { AnimatedGroup } from '@/src/components/ui/animated-group'
import { cn } from '@/src/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

/**
 * Apenas o conteúdo do Hero (sem header/nav próprio).
 * Use este dentro do seu <main> ou <section>.
 */
export function HeroContent() {
    return (
        <div className="overflow-hidden">
            {/* Fundo radial decorativo */}
            <div
                aria-hidden
                className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
            </div>

            <div className="relative pt-4 pb-0">
                {/* Gradiente de fade para baixo */}
                <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--lp-white,#fafaf8)_75%)]" />

                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center sm:mx-auto">
                        <AnimatedGroup variants={transitionVariants}>
                            {/* Badge animado */}
                            <a
                                href="#funcionalidades"
                                className="group mx-auto flex w-fit items-center gap-4 rounded-full border border-[#e4e4de] bg-[#f5f5f2] p-1 pl-4 shadow-sm transition-all duration-300 mb-8">
                                <span className="text-[#5c5c55] text-sm">✦ Sistema operacional para agências</span>
                                <span className="block h-4 w-0.5 border-l border-[#e4e4de]"></span>
                                <div className="bg-white group-hover:bg-[#f5f5f2] size-6 overflow-hidden rounded-full duration-500">
                                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                        <span className="flex size-6">
                                            <ArrowRight className="m-auto size-3 text-[#5c5c55]" />
                                        </span>
                                        <span className="flex size-6">
                                            <ArrowRight className="m-auto size-3 text-[#5c5c55]" />
                                        </span>
                                    </div>
                                </div>
                            </a>

                            {/* Título */}
                            <h1 className="mt-0 max-w-4xl mx-auto text-balance text-6xl md:text-7xl xl:text-[5rem] font-bold tracking-tight leading-[1.05] text-[#0d0d0d]"
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                                Sua agência organizada.{' '}
                                <em className="not-italic" style={{ color: '#1a6b45' }}>
                                    Clientes impressionados.
                                </em>
                            </h1>

                            {/* Subtítulo */}
                            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-[#5c5c55] leading-relaxed">
                                Tarefas, Brand Hub, portal do cliente e financeiro em um só lugar — com subdomínio exclusivo da sua agência. Chega de WhatsApp pra aprovar peça.
                            </p>
                        </AnimatedGroup>

                        {/* CTAs */}
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.5,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:opacity-90"
                                style={{ background: '#1a6b45' }}>
                                Criar minha conta grátis
                            </Link>
                            <a
                                href="#funcionalidades"
                                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-medium border border-[#d0d0ca] text-[#0d0d0d] transition-all duration-200 hover:border-[#0d0d0d]">
                                Ver funcionalidades
                            </a>
                        </AnimatedGroup>

                        {/* Nota */}
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: { delayChildren: 0.8 },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-4">
                            <p className="text-sm text-[#9b9b92]">
                                14 dias grátis · Sem cartão de crédito · Cancele quando quiser
                            </p>
                        </AnimatedGroup>
                    </div>
                </div>

                {/* Mockup do Dashboard */}
                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.05,
                                    delayChildren: 0.6,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}>
                    <div className="relative mt-12 overflow-hidden px-4 sm:px-6 md:mt-16">
                        {/* Fade gradient na parte de baixo */}
                        <div
                            aria-hidden
                            className="absolute inset-0 z-10 from-transparent to-[#fafaf8] bg-gradient-to-b from-60%"
                        />
                        {/* Card do mockup */}
                        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#e4e4de] bg-white p-4 shadow-xl shadow-black/8">
                            <div className="bg-[#f5f5f2] rounded-xl overflow-hidden" style={{ aspectRatio: '16/8.5' }}>
                                <div className="flex h-full">
                                    {/* Sidebar */}
                                    <div className="w-52 bg-white border-r border-[#e8e8e4] p-4 hidden md:flex flex-col gap-1 flex-shrink-0">
                                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#e8e8e4]">
                                            <div className="w-7 h-7 rounded-md bg-[#1a6b45] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">OK</div>
                                            <span className="text-xs font-semibold text-[#0d0d0d] truncate">Minha Agência</span>
                                        </div>
                                        {['Dashboard', 'Clientes', 'Tarefas', 'Brand Hub', 'Projetos', 'Finanças', 'Equipe'].map((item, i) => (
                                            <div key={item} className={cn(
                                                'text-[11px] py-1.5 px-2.5 rounded-md',
                                                i === 0
                                                    ? 'bg-[#e8f5ee] text-[#1a6b45] font-medium'
                                                    : 'text-[#5c5c55]'
                                            )}>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Conteúdo principal */}
                                    <div className="flex-1 p-5 overflow-hidden">
                                        <div className="text-xs font-medium text-[#5c5c55] mb-4">Visão geral · Abril 2026</div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                                            {[
                                                { label: 'Projetos ativos', value: '12', accent: false },
                                                { label: 'Receita do mês', value: 'R$18k', accent: true },
                                                { label: 'Tarefas pendentes', value: '34', accent: false },
                                                { label: 'Clientes ativos', value: '8', accent: false },
                                            ].map(stat => (
                                                <div key={stat.label} className="bg-white rounded-lg p-3 border border-[#e4e4de]">
                                                    <div className="text-[9px] text-[#9b9b92] mb-1">{stat.label}</div>
                                                    <div className={cn(
                                                        'text-base font-semibold',
                                                        stat.accent ? 'text-[#1a6b45]' : 'text-[#0d0d0d]'
                                                    )}>{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1.5">
                                            {[
                                                { text: 'Post Instagram — Marca X', tag: 'Feito', tagBg: '#e8f5ee', tagColor: '#1a6b45', done: true },
                                                { text: 'Identidade visual — Cliente Y', tag: 'Urgente', tagBg: '#fff3e0', tagColor: '#854F0B', done: false },
                                                { text: 'Revisão — Banner campanha', tag: 'Revisão', tagBg: '#f0f0ec', tagColor: '#5c5c55', done: false },
                                            ].map(task => (
                                                <div key={task.text} className="flex items-center gap-2.5 text-[11px] py-2 px-3 rounded-lg bg-white border border-[#e4e4de]">
                                                    <div className={cn(
                                                        'w-3.5 h-3.5 rounded-full border flex-shrink-0',
                                                        task.done ? 'bg-[#1a6b45] border-[#1a6b45]' : 'border-[#d4d4cc]'
                                                    )} />
                                                    <span className={cn('flex-1 truncate', task.done && 'line-through text-[#9b9b92]')}>{task.text}</span>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: task.tagBg, color: task.tagColor }}>{task.tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedGroup>
            </div>
        </div>
    )
}

/**
 * Seção de logos de clientes/parceiros (sem imagens externas quebradas).
 */
export function ClientLogosSection() {
    const partners = [
        { name: 'Agência Gaki', initial: 'AG' },
        { name: 'Studio X', initial: 'SX' },
        { name: 'Creative Co', initial: 'CC' },
        { name: 'Brand Lab', initial: 'BL' },
        { name: 'Media Plus', initial: 'MP' },
        { name: 'Design Hub', initial: 'DH' },
        { name: 'Nova Agency', initial: 'NA' },
        { name: 'Pixel Craft', initial: 'PC' },
    ]

    return (
        <div className="pb-12 pt-0">
            <div className="mx-auto max-w-3xl px-6">
                <p className="text-center text-xs text-[#9b9b92] uppercase tracking-widest mb-8">
                    Agências que já confiam no Okei
                </p>
                <div className="grid grid-cols-4 gap-x-10 gap-y-6">
                    {partners.map((p) => (
                        <div key={p.name} className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 rounded bg-[#e8f5ee] flex items-center justify-center text-[8px] font-bold text-[#1a6b45] flex-shrink-0">{p.initial}</div>
                            <span className="text-xs font-medium text-[#9b9b92] hidden sm:block">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
