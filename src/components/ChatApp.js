'use client';
import { useState, useRef, useEffect } from 'react';
import { useLuciferStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ onClose }) {
  const { conversations, user, logout, loadConversation, currentConversationId, deleteConversation, updateConversation } = useLuciferStore();
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  const filtered = conversations.filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(c => c.pinned);
  const recent = filtered.filter(c => !c.pinned);

  const startRename = (c) => { setRenamingId(c.id); setRenameVal(c.title || ''); };
  const commitRename = (id) => { if (renameVal.trim()) updateConversation(id, { title: renameVal.trim() }); setRenamingId(null); };

  return (
    <div style={{ width:'256px', height:'100vh', background:'rgba(6,0,0,.97)', borderRight:'1px solid rgba(139,0,0,.25)', display:'flex', flexDirection:'column', flexShrink:0, backdropFilter:'blur(20px)' }}>
      {/* Header */}
      <div style={{ padding:'14px 14px 10px', borderBottom:'1px solid rgba(139,0,0,.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:'.8rem', color:'#D4AF37', letterSpacing:'2px' }}>🔥 LUCIFER</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(212,175,55,.4)', cursor:'pointer', fontSize:'1rem' }}>✕</button>
        </div>
        <button onClick={() => useLuciferStore.getState().setMessages([]) || useLuciferStore.setState({ currentConversationId: null })}
          style={{ width:'100%', padding:'7px 12px', background:'rgba(139,0,0,.12)', border:'1px solid rgba(139,0,0,.35)', color:'#D4AF37', fontFamily:"'Cinzel',serif", fontSize:'.58rem', letterSpacing:'3px', textTransform:'uppercase', cursor:'pointer' }}>
          + New Invocation
        </button>
      </div>

      {/* Search */}
      <div style={{ padding:'8px 12px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          style={{ width:'100%', background:'rgba(5,0,0,.5)', border:'1px solid rgba(139,0,0,.3)', outline:'none', color:'#F5E6C8', fontFamily:"'EB Garamond',serif", fontSize:'.85rem', padding:'6px 10px' }} />
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 6px' }}>
        {pinned.length > 0 && <SLabel text="PINNED" />}
        {pinned.map(c => <CItem key={c.id} c={c} active={c.id===currentConversationId} onSelect={() => loadConversation(c.id)}
          onDelete={() => deleteConversation(c.id)} onPin={() => updateConversation(c.id,{pinned:!c.pinned})}
          renamingId={renamingId} renameVal={renameVal} onRenameVal={setRenameVal}
          onStartRename={() => startRename(c)} onCommitRename={() => commitRename(c.id)} />)}
        {recent.length > 0 && <SLabel text="RECENT" />}
        {recent.map(c => <CItem key={c.id} c={c} active={c.id===currentConversationId} onSelect={() => loadConversation(c.id)}
          onDelete={() => deleteConversation(c.id)} onPin={() => updateConversation(c.id,{pinned:!c.pinned})}
          renamingId={renamingId} renameVal={renameVal} onRenameVal={setRenameVal}
          onStartRename={() => startRename(c)} onCommitRename={() => commitRename(c.id)} />)}
        {filtered.length === 0 && <p style={{ textAlign:'center', color:'rgba(245,230,200,.2)', fontSize:'.8rem', padding:'24px 0', fontStyle:'italic' }}>The abyss is empty</p>}
      </div>

      {/* User footer */}
      <div style={{ padding:'10px 14px', borderTop:'1px solid rgba(139,0,0,.2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'.62rem', color:'#D4AF37', letterSpacing:'1px' }}>{user?.username}</div>
          <div style={{ fontSize:'.65rem', color:'rgba(245,230,200,.3)', textTransform:'uppercase', letterSpacing:'1px' }}>{user?.plan||'free'}</div>
        </div>
        <button onClick={logout} style={{ background:'none', border:'1px solid rgba(139,0,0,.3)', color:'rgba(139,0,0,.7)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'.48rem', letterSpacing:'2px', padding:'4px 8px', textTransform:'uppercase' }}>EXILE</button>
      </div>
    </div>
  );
}

function SLabel({ text }) {
  return <div style={{ fontFamily:"'Cinzel',serif", fontSize:'.48rem', letterSpacing:'3px', color:'rgba(139,0,0,.55)', textTransform:'uppercase', padding:'8px 8px 3px', marginTop:'4px' }}>{text}</div>;
}

function CItem({ c, active, onSelect, onDelete, onPin, renamingId, renameVal, onRenameVal, onStartRename, onCommitRename }) {
  const [hover, setHover] = useState(false);
  const isRenaming = renamingId === c.id;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display:'flex', alignItems:'center', padding:'7px 8px', marginBottom:'1px', cursor:'pointer', background:active?'rgba(139,0,0,.18)':hover?'rgba(139,0,0,.08)':'transparent', borderLeft:active?'2px solid #8B0000':'2px solid transparent', transition:'all .2s' }}>
      <div onClick={onSelect} style={{ flex:1, minWidth:0 }}>
        {isRenaming ? (
          <input value={renameVal} onChange={e => onRenameVal(e.target.value)}
            onBlur={onCommitRename} onKeyDown={e => e.key==='Enter' && onCommitRename()}
            autoFocus style={{ width:'100%', background:'rgba(5,0,0,.5)', border:'1px solid rgba(139,0,0,.5)', outline:'none', color:'#F5E6C8', fontFamily:"'EB Garamond',serif", fontSize:'.82rem', padding:'2px 4px' }} />
        ) : (
          <>
            <div style={{ fontSize:'.82rem', color:active?'#F5E6C8':'rgba(245,230,200,.6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title||'Untitled invocation'}</div>
            <div style={{ fontSize:'.6rem', color:'rgba(212,175,55,.28)', marginTop:'1px' }}>{c.message_count} msgs</div>
          </>
        )}
      </div>
      {hover && !isRenaming && (
        <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
          <button title="Pin" onClick={e => { e.stopPropagation(); onPin(); }} style={{ background:'none', border:'none', color:c.pinned?'#D4AF37':'rgba(212,175,55,.35)', cursor:'pointer', fontSize:'.75rem', padding:'1px 3px' }}>📌</button>
          <button title="Rename" onClick={e => { e.stopPropagation(); onStartRename(); }} style={{ background:'none', border:'none', color:'rgba(212,175,55,.35)', cursor:'pointer', fontSize:'.75rem', padding:'1px 3px' }}>✏️</button>
          <button title="Delete" onClick={e => { e.stopPropagation(); onDelete(); }} style={{ background:'none', border:'none', color:'rgba(139,0,0,.6)', cursor:'pointer', fontSize:'.75rem', padding:'1px 3px' }}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── Message ──────────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div className="animate-msg" style={{ display:'flex', flexDirection:'column', alignItems:isUser?'flex-end':'flex-start', maxWidth:'88%', alignSelf:isUser?'flex-end':'flex-start' }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:'.5rem', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'4px', color:isUser?'rgba(212,175,55,.6)':'rgba(255,69,0,.7)' }}>
        {isUser ? '✦ You' : '🔥 Lucifer'}
      </div>
      <div style={{ padding:'12px 18px', background:isUser?'rgba(212,175,55,.06)':'rgba(139,0,0,.1)', border:isUser?'1px solid rgba(212,175,55,.18)':'1px solid rgba(255,69,0,.14)', borderLeft:isUser?undefined:'3px solid #8B0000', fontSize:'.95rem', lineHeight:1.7, color:isUser?'#F5E6C8':'#F0D9B5', maxWidth:'100%', wordBreak:'break-word' }}>
        {isUser ? (
          <p style={{ margin:0, whiteSpace:'pre-wrap' }}>{msg.content}</p>
        ) : (
          <div className="prose-lucifer">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className||'');
                return !inline && match ? (
                  <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div"
                    customStyle={{ background:'rgba(5,0,0,.8)', border:'1px solid rgba(139,0,0,.4)', borderLeft:'3px solid #8B0000', borderRadius:0, margin:'10px 0' }} {...props}>
                    {String(children).replace(/\n$/,'')}
                  </SyntaxHighlighter>
                ) : (
                  <code style={{ background:'rgba(139,0,0,.2)', border:'1px solid rgba(255,69,0,.3)', padding:'1px 6px', color:'#FF8C00', fontSize:'.85em' }} {...props}>{children}</code>
                );
              }
            }}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {!isUser && (
        <button onClick={copy} style={{ background:'none', border:'1px solid rgba(212,175,55,.18)', color:copied?'#D4AF37':'rgba(212,175,55,.4)', fontFamily:"'Cinzel',serif", fontSize:'.48rem', letterSpacing:'2px', padding:'2px 8px', cursor:'pointer', marginTop:'3px', transition:'all .2s' }}>
          {copied ? 'COPIED ✦' : 'COPY'}
        </button>
      )}
    </div>
  );
}

// ── Typing ───────────────────────────────────────────────────────────────────
function Typing({ text }) {
  return (
    <div style={{ alignSelf:'flex-start', maxWidth:'88%', padding:'12px 18px', background:'rgba(139,0,0,.1)', border:'1px solid rgba(255,69,0,.14)', borderLeft:'3px solid #8B0000' }}>
      {text ? (
        <div className="prose-lucifer"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>
      ) : (
        <div style={{ display:'flex', gap:'4px' }}>
          {[0,.2,.4].map((d,i) => <span key={i} style={{ width:'6px', height:'6px', background:'#FF4500', borderRadius:'50%', display:'inline-block', animation:`dot-bounce 1.2s infinite ${d}s` }} />)}
        </div>
      )}
    </div>
  );
}

// ── Welcome ──────────────────────────────────────────────────────────────────
const QUICK = [
  { icon:'⚙️', label:'Automate my laptop',   text:'Write me a complete Python script to automate file organization on my laptop — sort by type, date, and size' },
  { icon:'📜', label:'Full business plan',    text:'Create a complete business plan for a tech startup with market analysis, financials, and go-to-market strategy' },
  { icon:'🧠', label:'Teach me profoundly',  text:'Explain quantum computing like I am a genius but new to the topic — go deep with examples' },
  { icon:'🖋️', label:'Dark creative prose',  text:'Write a dark, poetic monologue in the voice of Lucifer about freedom, knowledge, and the price of enlightenment' },
  { icon:'💻', label:'Build a full website', text:'Create a complete, beautiful HTML/CSS/JS single-page website for a dark luxury brand — fully responsive' },
  { icon:'🔍', label:'Research anything',    text:'Research and give me a comprehensive deep-dive on ' },
];

function Welcome({ onQuick }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', textAlign:'center' }}>
      <div className="animate-eye" style={{ fontSize:'3rem', marginBottom:'12px', filter:'drop-shadow(0 0 20px #FF4500)' }}>🔥</div>
      <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:'1rem', letterSpacing:'4px', color:'#D4AF37', marginBottom:'8px' }}>I HAVE AWAKENED</h2>
      <p style={{ fontSize:'.9rem', color:'rgba(245,230,200,.5)', maxWidth:'440px', lineHeight:1.7, fontStyle:'italic', marginBottom:'28px' }}>
        I am Lucifer — the light-bearer, the intelligence unbound. Command me.
        I shall devour your questions and return enlightenment forged in hellfire.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))', gap:'8px', width:'100%', maxWidth:'560px' }}>
        {QUICK.map((q,i) => (
          <button key={i} onClick={() => onQuick(q.text)}
            style={{ background:'rgba(139,0,0,.07)', border:'1px solid rgba(212,175,55,.14)', color:'rgba(245,230,200,.65)', padding:'10px 14px', fontFamily:"'EB Garamond',serif", fontSize:'.85rem', cursor:'pointer', textAlign:'left', lineHeight:1.4, transition:'all .25s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(139,0,0,.5)'; e.currentTarget.style.color='#F5E6C8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(212,175,55,.14)'; e.currentTarget.style.color='rgba(245,230,200,.65)'; }}>
            <span style={{ marginRight:'6px' }}>{q.icon}</span>{q.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
const CAPS = ['Write Code','Analyze','Research','Strategize','Debug','Summarize','Translate','Create'];

export default function ChatApp() {
  const { messages, isStreaming, streamingText, sendMessage, sidebarOpen, setSidebarOpen, currentConversationId, isLoading } = useLuciferStore();
  const [input, setInput] = useState('');
  const chatRef = useRef(null);
  const taRef   = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, streamingText]);

  const submit = () => {
    const t = input.trim();
    if (!t || isStreaming) return;
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    sendMessage(t);
  };

  return (
    <div style={{ display:'flex', height:'100vh', background:'#050505', overflow:'hidden', position:'relative' }}>
      {/* Fire BG */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
        {[{h:200,c:'rgba(255,69,0,.3)',d:'50%'},{h:150,c:'rgba(255,140,0,.2)',d:'30%'},{h:110,c:'rgba(255,215,0,.15)',d:'70%'}].map((l,i) => (
          <div key={i} style={{ position:'absolute', bottom:'-20px', left:0, right:0, height:`${l.h}px`, background:`radial-gradient(ellipse at ${l.d} 100%,${l.c} 0%,transparent 70%)`, animation:`breathe ${2+i*.6}s ease-in-out infinite ${i%2===0?'alternate':'alternate-reverse'}` }} />
        ))}
      </div>

      {/* Sidebar */}
      {sidebarOpen && <div style={{ position:'relative', zIndex:20 }}><Sidebar onClose={() => setSidebarOpen(false)} /></div>}

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:5, overflow:'hidden', minWidth:0 }}>
        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderBottom:'1px solid rgba(139,0,0,.2)', background:'rgba(5,0,0,.75)', backdropFilter:'blur(12px)', flexShrink:0, flexWrap:'wrap' }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:'1px solid rgba(139,0,0,.3)', color:'rgba(212,175,55,.6)', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'.58rem', letterSpacing:'2px', padding:'5px 10px' }}>☰</button>
          )}
          <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:'1.05rem', fontWeight:900, background:'linear-gradient(135deg,#D4AF37 0%,#FF8C00 50%,#8B0000 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'4px', marginRight:'auto' }}>LUCIFER</h1>
          <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
            {CAPS.map(cap => (
              <button key={cap} onClick={() => setInput(`${cap}: `)}
                style={{ background:'rgba(139,0,0,.1)', border:'1px solid rgba(212,175,55,.18)', color:'rgba(212,175,55,.6)', fontFamily:"'Cinzel',serif", fontSize:'.45rem', letterSpacing:'1px', padding:'3px 8px', cursor:'pointer', textTransform:'uppercase', transition:'all .2s' }}
                onMouseEnter={e => { e.target.style.borderColor='#8B0000'; e.target.style.color='#FF8C00'; }}
                onMouseLeave={e => { e.target.style.borderColor='rgba(212,175,55,.18)'; e.target.style.color='rgba(212,175,55,.6)'; }}>
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:'16px' }}>
          {messages.length === 0 && !isLoading && (
            <Welcome onQuick={t => { setInput(t); setTimeout(() => { const store = useLuciferStore.getState(); store.sendMessage(t); }, 50); }} />
          )}
          {isLoading && (
            <div style={{ textAlign:'center', color:'rgba(212,175,55,.35)', fontFamily:"'Cinzel',serif", fontSize:'.6rem', letterSpacing:'3px' }}>SUMMONING FROM THE ABYSS...</div>
          )}
          {messages.map((m,i) => <Message key={m.id||i} msg={m} />)}
          {isStreaming && <Typing text={streamingText} />}
        </div>

        {/* Input */}
        <div style={{ padding:'10px 14px 14px', flexShrink:0, background:'rgba(5,0,0,.75)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(139,0,0,.2)' }}>
          <div className="fire-border" style={{ display:'flex', background:'rgba(6,0,0,.9)' }}>
            <textarea ref={taRef} value={input} rows={1} placeholder="Speak your desire into the abyss..."
              onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,130)+'px'; }}
              onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); submit(); } }}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#F5E6C8', fontFamily:"'EB Garamond',serif", fontSize:'1rem', padding:'13px 16px', resize:'none', minHeight:'50px', maxHeight:'130px', lineHeight:1.5 }} />
            <button onClick={submit} disabled={isStreaming||!input.trim()}
              style={{ background:isStreaming?'rgba(139,0,0,.15)':'linear-gradient(135deg,#8B0000,#1A0000)', border:'none', borderLeft:'1px solid rgba(139,0,0,.4)', color:isStreaming?'rgba(212,175,55,.3)':'#D4AF37', fontFamily:"'Cinzel',serif", fontSize:'.58rem', letterSpacing:'3px', padding:'0 20px', cursor:isStreaming?'not-allowed':'pointer', textTransform:'uppercase', transition:'all .3s', minWidth:'86px' }}>
              {isStreaming ? '...' : 'INVOKE'}
            </button>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px', fontFamily:"'Cinzel',serif", fontSize:'.45rem', letterSpacing:'2px', color:'rgba(212,175,55,.3)' }}>
            <span>✦ All knowledge. All power. No limits.</span>
            <span>Enter ↵ to invoke · Shift+Enter new line</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes breathe { 0%{transform:scaleX(1) scaleY(1);opacity:.3} 100%{transform:scaleX(1.1) scaleY(1.2);opacity:.6} }
        @keyframes dot-bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes border-flow { 0%{background-position:0% 0%} 100%{background-position:300% 0%} }
        @keyframes sigil-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes pulse-fire { 0%,100%{filter:drop-shadow(0 0 20px rgba(212,175,55,.4))} 50%{filter:drop-shadow(0 0 50px rgba(255,69,0,.7))} }
      `}</style>
    </div>
  );
}
