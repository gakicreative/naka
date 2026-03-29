const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/KanbanBoard.tsx');
const src = fs.readFileSync(filePath, 'utf8');
const lines = src.split('\n');

// ── Step 1: Remove "chat" entry from TASK_TABS ────────────────────────────────
const chatTabLine = `    { id: 'chat', label: 'Chat', icon: MessageSquare },`;
const taskTabsIdx = lines.findIndex(l => l === chatTabLine);
if (taskTabsIdx === -1) throw new Error('Could not find TASK_TABS chat entry');
lines.splice(taskTabsIdx, 1);
console.log('✔ Removed chat from TASK_TABS (was line', taskTabsIdx + 1, ')');

// ── Step 2: Find structural landmarks ─────────────────────────────────────────
const tabBarIdx       = lines.findIndex(l => l.includes('{/* ─── Tab Bar ─── */}'));
const chatCommentIdx  = lines.findIndex(l => l.includes('{/* ── Chat ── */}'));

// Find </AnimatePresence> AFTER tabBarIdx
let animCloseIdx = -1;
for (let i = tabBarIdx; i < lines.length; i++) {
  if (lines[i].includes('</AnimatePresence>')) { animCloseIdx = i; break; }
}
const tabContentDivEnd = animCloseIdx + 1; // </div> closing the tab content

// Find </motion.div> AFTER tabBarIdx (just before </AnimatePresence>)
const motionDivCloseIdx = animCloseIdx - 1;

// Find the motion.div with className
let motionDivOpenIdx = -1;
for (let i = tabBarIdx; i < chatCommentIdx; i++) {
  if (lines[i].includes('className={cn("h-full"')) { motionDivOpenIdx = i; break; }
}

console.log('tabBarIdx:', tabBarIdx + 1);
console.log('chatCommentIdx:', chatCommentIdx + 1);
console.log('motionDivOpenIdx:', motionDivOpenIdx + 1);
console.log('motionDivCloseIdx:', motionDivCloseIdx + 1);
console.log('animCloseIdx:', animCloseIdx + 1);
console.log('tabContentDivEnd:', tabContentDivEnd + 1);

// ── Step 3: Find the chat inner content ──────────────────────────────────────
// Chat conditional: {activeTab === "chat" && (\n <>\n ...content... \n </> \n )}
// The chat conditional ends at motionDivCloseIdx - 1 or so
// Find )} that closes the chat conditional — search backwards from motionDivCloseIdx
let chatConditionalCloseIdx = -1;
for (let i = motionDivCloseIdx - 1; i > chatCommentIdx; i--) {
  if (lines[i].trim() === ')}') { chatConditionalCloseIdx = i; break; }
}

// Find <> opening (right after conditional opening)
const chatConditionalOpenIdx = chatCommentIdx + 1; // {activeTab === "chat" && (
const chatFragmentOpenIdx    = chatConditionalOpenIdx + 1; // <>

// Find </> just before )} of the conditional
let chatFragmentCloseIdx = -1;
for (let i = chatConditionalCloseIdx - 1; i > chatFragmentOpenIdx; i--) {
  if (lines[i].trim() === '</>') { chatFragmentCloseIdx = i; break; }
}

console.log('chatConditionalOpenIdx:', chatConditionalOpenIdx + 1, '→', JSON.stringify(lines[chatConditionalOpenIdx]));
console.log('chatFragmentOpenIdx:', chatFragmentOpenIdx + 1, '→', JSON.stringify(lines[chatFragmentOpenIdx]));
console.log('chatFragmentCloseIdx:', chatFragmentCloseIdx + 1, '→', JSON.stringify(lines[chatFragmentCloseIdx]));
console.log('chatConditionalCloseIdx:', chatConditionalCloseIdx + 1, '→', JSON.stringify(lines[chatConditionalCloseIdx]));

if (chatFragmentCloseIdx === -1) throw new Error('Could not find chat fragment </>');

// Extract inner chat content (between <> and </> exclusive)
const chatInnerLines = lines.slice(chatFragmentOpenIdx + 1, chatFragmentCloseIdx);
console.log('chatInnerLines count:', chatInnerLines.length);

// ── Step 4: Extract 3 tab content blocks ─────────────────────────────────────
const threeTabsStart = motionDivOpenIdx + 2; // skip className line + blank line
const threeTabsEnd   = chatCommentIdx - 1;   // stop before blank + chat comment
const threeTabsLines = lines.slice(threeTabsStart, threeTabsEnd);
console.log('threeTabsStart:', threeTabsStart + 1);
console.log('threeTabsEnd:', threeTabsEnd + 1);
console.log('threeTabsLines count:', threeTabsLines.length);

// ── Step 5: Build the new block ───────────────────────────────────────────────
const I = '        '; // 8-space indent

const newBlock = [
  `${I}{/* ─── Body: Left tabs + Right chat ─── */}`,
  `${I}<div className="flex-1 flex overflow-hidden min-h-0">`,
  ``,
  `${I}  {/* Left column: tab bar + content */}`,
  `${I}  <div className="flex-1 flex flex-col min-w-0 border-r border-[#2a2a2a]">`,
  ``,
  `${I}    {/* ─── Tab Bar ─── */}`,
  `${I}    <div className="flex-shrink-0 flex gap-1 p-1 bg-[#1c1c1c] border-b border-white/5">`,
  `${I}      {TASK_TABS.map(tab => {`,
  `${I}        const TabIcon = tab.icon;`,
  `${I}        return (`,
  `${I}          <button`,
  `${I}            key={tab.id}`,
  `${I}            onClick={() => setActiveTab(tab.id)}`,
  `${I}            className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',`,
  `${I}              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'`,
  `${I}            )}`,
  `${I}          >`,
  `${I}            <TabIcon className="w-4 h-4" />`,
  `${I}            <span className="hidden sm:inline">{tab.label}</span>`,
  `${I}          </button>`,
  `${I}        );`,
  `${I}      })}`,
  `${I}    </div>`,
  ``,
  `${I}    {/* ─── Tab Content ─── */}`,
  `${I}    <div className="flex-1 overflow-hidden min-h-0">`,
  `${I}      <AnimatePresence mode="wait">`,
  `${I}        <motion.div`,
  `${I}          key={activeTab}`,
  `${I}          initial={{ opacity: 0, y: 8 }}`,
  `${I}          animate={{ opacity: 1, y: 0 }}`,
  `${I}          exit={{ opacity: 0, y: -8 }}`,
  `${I}          transition={{ duration: 0.15 }}`,
  `${I}          className="h-full overflow-y-auto"`,
  `${I}        >`,
  ``,
  ...threeTabsLines,
  ``,
  `${I}        </motion.div>`,
  `${I}      </AnimatePresence>`,
  `${I}    </div>`,
  `${I}  </div>`,
  ``,
  `${I}  {/* Right column: Chat (always visible) */}`,
  `${I}  <div className="w-[360px] flex flex-col flex-shrink-0">`,
  ...chatInnerLines,
  `${I}  </div>`,
  ``,
  `${I}</div>`,
];

// ── Step 6: Replace lines tabBarIdx..tabContentDivEnd ────────────────────────
const before = lines.slice(0, tabBarIdx);
const after  = lines.slice(tabContentDivEnd + 1);
const result = [...before, ...newBlock, ...after].join('\n');
fs.writeFileSync(filePath, result, 'utf8');

console.log('\n✅ Done!');
console.log('  Replaced lines', tabBarIdx + 1, '→', tabContentDivEnd + 1, 'with', newBlock.length, 'lines');
