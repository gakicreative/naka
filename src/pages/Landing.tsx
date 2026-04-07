import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroContent, ClientLogosSection } from '@/src/components/blocks/hero-section-1';
import '../landing.css';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: 'Brand Hub por cliente',
    desc: 'Paleta de cores, tipografia, logos, tom de voz e links do Figma — organizados por cliente e sublinkados nas tarefas do designer. Sem e-mail, sem Drive perdido.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
    ),
    title: 'Feedback visual em imagens',
    desc: 'O cliente clica no ponto exato da peça e deixa o comentário ali. Sem descrever onde está o problema. Sem interpretação errada. Mais agilidade na revisão.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Portal exclusivo do cliente',
    desc: 'Seu cliente acessa o painel com a sua marca, vê só as tarefas dele, acompanha o andamento, avalia as entregas e solicita novas demandas. Profissionalismo visível.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    title: '5 modos de visualização de tarefas',
    desc: 'Kanban, lista, calendário, timeline (Gantt) e board por cliente. O app lembra qual você usou por último. Cada perfil trabalha do jeito que pensa.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    title: 'Financeiro integrado',
    desc: 'Receitas, despesas, recebíveis e receita por cliente num único painel. Gráfico de 6 meses. Filtros por mês, tipo, status e cliente. Só para Admin — dados protegidos.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'Contratos e gestão de clientes',
    desc: 'Dados legais, CNPJ, retainer, saúde do cliente, NPS, notas fiscais e controle de pagamento — tudo na página do cliente.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      </svg>
    ),
    title: 'Gestão de equipe com perfis',
    desc: 'Admin, Sócio, Líder, Seeder e Cliente — cada um acessa só o que precisa. Tarefas ativas, concluídas e taxa de conclusão por membro. Convite por link com papel definido.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6M9 12h6M9 15h4"/>
      </svg>
    ),
    title: 'Dashboard com visão geral',
    desc: 'Projetos ativos, tarefas pendentes, clientes ativos e receita do mês numa tela só. Prioridades em destaque. Tudo que você precisa saber ao abrir o app pela manhã.',
  },
];

const roles = [
  { badge: 'Admin', badgeStyle: { background: '#faeeda', color: '#633806' }, name: 'Dono / sócio principal', access: 'Acesso total — clientes, projetos, equipe, finanças e convites.' },
  { badge: 'Sócio', badgeStyle: { background: '#e8f5ee', color: '#085041' }, name: 'Co-fundador / sócio', access: 'Clientes, projetos, tarefas e configurações da organização.' },
  { badge: 'Líder', badgeStyle: { background: '#eeedfe', color: '#3C3489' }, name: 'Gestor de equipe', access: 'Projetos e tarefas da sua equipe. Visão operacional sem acesso financeiro.' },
  { badge: 'Seeder', badgeStyle: { background: '#f1efe8', color: '#444441' }, name: 'Designer / executor', access: 'Tarefas atribuídas e projetos do seu líder. Foco total na execução.' },
  { badge: 'Cliente', badgeStyle: { background: '#e6f1fb', color: '#0C447C' }, name: 'Cliente final', access: 'Portal próprio — vê só as tarefas e a marca dele. Solicita, aprova e avalia.' },
];

const faqs = [
  {
    q: 'Preciso migrar todos os meus dados antes de começar?',
    a: 'Não. Você começa do zero e vai adicionando clientes, projetos e tarefas conforme usa. Não é necessário importar histórico. A maioria das agências configura o essencial em menos de 30 minutos.',
  },
  {
    q: 'Meu cliente precisa criar conta em alguma plataforma?',
    a: 'Sim, mas é simples. Você gera um link de convite pelo Okei, o cliente acessa, cria uma conta com Google ou e-mail e já entra direto no portal com a sua marca. O processo leva menos de 2 minutos.',
  },
  {
    q: 'O subdomínio fica comigo se eu cancelar o plano?',
    a: 'O subdomínio está vinculado à sua conta ativa no Okei. Se cancelar, o portal sai do ar. Seus dados ficam disponíveis para exportação por 30 dias após o cancelamento.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Sem multa, sem burocracia. No plano mensal, o cancelamento é imediato. No plano anual, você mantém o acesso até o fim do período pago.',
  },
  {
    q: 'O suporte é em português?',
    a: 'Sim. O Okei é um produto brasileiro, com suporte em português via chat e e-mail. No plano Estúdio, o atendimento é prioritário com tempo de resposta garantido.',
  },
  {
    q: 'Quantos clientes posso cadastrar?',
    a: 'No plano Solo, até 5 clientes ativos. Nos planos Agência e Estúdio, clientes ilimitados. Você pode arquivar clientes inativos para não contar no limite.',
  },
  {
    q: 'O Okei funciona para agências de qualquer nicho?',
    a: 'Sim. O sistema foi pensado para agências criativas em geral — social media, design, tráfego pago, branding, conteúdo. Se você gerencia clientes, projetos e uma equipe criativa, o Okei foi feito para você.',
  },
];

const CheckIcon = () => (
  <svg viewBox="0 0 10 10">
    <polyline points="2,5 4,7 8,3" />
  </svg>
);

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lp-nav">
        <span className="lp-logo">Okei<span>.</span>agency</span>
        <div className="lp-nav-links">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#faq">FAQ</a>
          <Link to="/login" className="lp-btn lp-btn-outline">Entrar</Link>
          <Link to="/login" className="lp-btn lp-btn-primary">Começar grátis</Link>
        </div>
      </nav>

      {/* HERO (novo estilo animado) */}
      <section className="lp-hero-new">
        <HeroContent />
      </section>

      {/* LOGOS */}
      <section className="lp-logos-section">
        <ClientLogosSection />
      </section>

      {/* PROBLEM */}
      <section className="lp-problem">
        <div className="lp-problem-inner">
          <div className="lp-problem-label">O problema real</div>
          <h2 className="lp-problem-title">
            Você gerencia sua agência em<br />
            <em>quantas ferramentas ao mesmo tempo?</em>
          </h2>
          <div className="lp-chaos-grid">
            {[
              { name: 'WhatsApp', use: 'aprovar peças' },
              { name: 'Trello / Notion', use: 'controlar tarefas' },
              { name: 'Google Drive', use: 'guardar arquivos' },
              { name: 'Planilha', use: 'controle financeiro' },
              { name: 'E-mail', use: 'enviar contratos' },
              { name: 'Word / PDF', use: 'guardar briefings' },
            ].map((t) => (
              <div key={t.name} className="lp-chaos-item">
                <div className="lp-chaos-item-name">{t.name}</div>
                <div className="lp-chaos-item-use">{t.use}</div>
              </div>
            ))}
          </div>
          <p className="lp-problem-body">
            Isso não é gestão. É improviso. Cada ferramenta que você usa tem um custo — não só financeiro, mas de tempo, atenção e credibilidade. Seu cliente percebe quando você não tem processo. O Okei coloca tudo em um lugar só, com o nome da sua agência na frente.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-features-section" id="funcionalidades">
        <div className="lp-container">
          <div className="lp-section-label-line">
            <span className="lp-section-label-text">Funcionalidades</span>
            <div className="lp-section-label-rule" />
          </div>
          <h2 className="lp-section-title">Tudo que sua agência precisa.<br />Num lugar só.</h2>
          <p className="lp-section-subtitle">Cada funcionalidade foi pensada para o dia a dia de quem gerencia clientes, designers e entregas ao mesmo tempo.</p>
          <div className="lp-features-grid">
            {features.map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBDOMAIN */}
      <section className="lp-subdomain-section">
        <div className="lp-subdomain-inner">
          <div>
            <div className="lp-section-label-line">
              <span className="lp-section-label-text">Subdomínio exclusivo</span>
              <div className="lp-section-label-rule" />
            </div>
            <h2 className="lp-section-title" style={{ marginBottom: '1rem' }}>Sua marca<br />na frente do cliente.</h2>
            <p style={{ fontSize: '1rem', color: 'var(--lp-gray-600)', fontWeight: 300, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Quando seu cliente abre o painel de tarefas, ele vê a sua agência — não uma ferramenta genérica. O Okei fica nos bastidores. Você fica na frente.
            </p>
            <div className="lp-url-benefits">
              {[
                'Cada agência tem seu próprio subdomínio — isolado e exclusivo',
                'O cliente acessa sem precisar instalar nada ou criar conta em outra plataforma',
                'Seu logo aparece no painel — o cliente lembra de quem está cuidando dele',
                'O TLD .agency já posiciona sua marca antes de abrir a primeira página',
              ].map((b) => (
                <div key={b} className="lp-url-benefit">
                  <div className="lp-url-benefit-check"><CheckIcon /></div>
                  {b}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="lp-url-demo">
              <div className="lp-url-demo-label">URL do portal do cliente</div>
              <div className="lp-url-demo-text"><strong>minhaagencia</strong>.okei<span className="tld">.agency</span></div>
            </div>
            <div className="lp-url-demo">
              <div className="lp-url-demo-label">Exemplos reais</div>
              <div className="lp-url-demo-text" style={{ marginBottom: 6 }}><strong>gaki</strong>.okei<span className="tld">.agency</span></div>
              <div className="lp-url-demo-text" style={{ marginBottom: 6 }}><strong>studiox</strong>.okei<span className="tld">.agency</span></div>
              <div className="lp-url-demo-text"><strong>agencianomundo</strong>.okei<span className="tld">.agency</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="lp-roles-section">
        <div className="lp-container">
          <div className="lp-section-label-line">
            <span className="lp-section-label-text">Perfis de acesso</span>
            <div className="lp-section-label-rule" />
          </div>
          <h2 className="lp-section-title">Cada pessoa vê<br />só o que precisa ver.</h2>
          <p className="lp-section-subtitle">Sem exposição de dados sensíveis. Sem confusão de permissões. Cada perfil é configurado no convite — sem burocracia.</p>
          <div className="lp-roles-grid">
            {roles.map((r) => (
              <div key={r.badge} className="lp-role-card">
                <div className="lp-role-badge" style={r.badgeStyle}>{r.badge}</div>
                <div className="lp-role-name">{r.name}</div>
                <div className="lp-role-access">{r.access}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq-section" id="faq">
        <div className="lp-container-sm">
          <div className="lp-section-label-line">
            <span className="lp-section-label-text">FAQ</span>
            <div className="lp-section-label-rule" />
          </div>
          <h2 className="lp-section-title">Perguntas que sua equipe<br />vai fazer antes de assinar.</h2>
          <div className="lp-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`lp-faq-item${openFaq === i ? ' open' : ''}`}>
                <button
                  className="lp-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <div className="lp-faq-icon">+</div>
                </button>
                <div className="lp-faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-cta-final" id="cta">
        <h2 className="lp-cta-final-title">
          Sua agência merece um sistema<br /><em>que realmente funciona.</em>
        </h2>
        <p className="lp-cta-final-sub">Configure em menos de 10 minutos. Sem cartão de crédito. 14 dias grátis.</p>
        <Link to="/login" className="lp-btn lp-btn-green lp-btn-lg">Criar minha conta grátis</Link>
        <p className="lp-cta-final-note" style={{ marginTop: '1rem' }}>Ao cadastrar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <span className="lp-footer-logo">Okei<span>.</span>agency</span>
        <div className="lp-footer-links">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#faq">FAQ</a>
          <a href="#">Termos</a>
          <a href="#">Privacidade</a>
        </div>
        <p className="lp-footer-copy">© 2026 Okei Agency. Feito no Brasil.</p>
      </footer>
    </div>
  );
}
