'use client';
import { useState } from 'react';
import { useLuciferStore } from '@/lib/store';

export default function AuthScreen() {
  const [mode, setMode]   = useState('login');
  const [form, setForm]   = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useLuciferStore(s => s.setAuth);

  const S = {
    wrap: { minHeight:'100vh', background:'#050505', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'EB Garamond',serif", position:'relative', overflow:'hidden' },
    glow: { position:'fixed', bottom:0, left:0, right:0, height:'220px', background:'radial-gradient(ellipse at 50% 100%,rgba(255,69,0,.25) 0%,transparent 70%)', pointerEvents:'none' },
    box:  { width:'100%', maxWidth:'380px', background:'rgba(8,0,0,.9)', border:'1px solid rgba(139,0,0,.5)', padding:'32px', backdropFilter:'blur(20px)', position:'relative' },
    bar:  { position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,#8B0000,#FF8C00,#D4AF37,#FF8C00,#8B0000)', backgroundSize:'300% 100%', animation:'border-flow 3s linear infinite' },
    tab:  (active) => ({ flex:1, background:'none', border:'none', cursor:'pointer', fontFamily:"'Cinzel',serif", fontSize:'.68rem', letterSpacing:'3px', textTransform:'uppercase', padding:'9px', color:active?'#D4AF37':'rgba(245,230,200,.3)', borderBottom:active?'2px solid #8B0000':'2px solid transparent', transition:'all .3s' }),
    btn:  (dis) => ({ width:'100%', marginTop:'24px', padding:'14px', background:dis?'rgba(139,0,0,.25)':'linear-gradient(135deg,#8B0000,#1A0000)', border:'1px solid rgba(139,0,0,.6)', color:dis?'rgba(212,175,55,.35)':'#D4AF37', fontFamily:"'Cinzel',serif", fontSize:'.68rem', letterSpacing:'4px', textTransform:'uppercase', cursor:dis?'not-allowed':'pointer', transition:'all .3s' }),
  };

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth-login' : '/api/auth-register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };
      const res  = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      setAuth(data.token, data.user);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={S.wrap}>
      <div style={S.glow} />
      {/* Sigil */}
      <div style={{ marginBottom:'20px' }}>
        <svg width="72" height="72" viewBox="0 0 200 200" fill="none"
          style={{ filter:'drop-shadow(0 0 18px #FF4500)', animation:'sigil-spin 20s linear infinite' }}>
          <circle cx="100" cy="100" r="95" stroke="#D4AF37" strokeWidth="1" opacity=".7"/>
          <polygon points="100,10 122,76 192,76 136,118 158,184 100,142 42,184 64,118 8,76 78,76"
            stroke="#D4AF37" strokeWidth="1" fill="none" opacity=".8"/>
        </svg>
      </div>

      <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:'clamp(1.8rem,5vw,2.8rem)', fontWeight:900, background:'linear-gradient(135deg,#D4AF37 0%,#FF8C00 50%,#8B0000 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'6px', marginBottom:'4px', animation:'pulse-fire 4s ease-in-out infinite' }}>
        LUCIFER
      </h1>
      <p style={{ fontFamily:"'Cinzel',serif", fontSize:'.6rem', letterSpacing:'6px', color:'#8B0000', marginBottom:'32px', textTransform:'uppercase' }}>The Fallen Intelligence</p>

      <div style={S.box}>
        <div style={S.bar} />
        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(139,0,0,.25)', marginBottom:'24px' }}>
          <button style={S.tab(mode==='login')}    onClick={() => { setMode('login');    setError(''); }}>Enter</button>
          <button style={S.tab(mode==='register')} onClick={() => { setMode('register'); setError(''); }}>Awaken</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {mode === 'register' && (
            <Field label="USERNAME" value={form.username} onChange={v => setForm(f=>({...f,username:v}))} placeholder="your_dark_name" />
          )}
          <Field label="EMAIL" type="email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} placeholder="soul@abyss.com" />
          <Field label="PASSWORD" type="password" value={form.password} onChange={v => setForm(f=>({...f,password:v}))} placeholder="••••••••" onEnter={submit} />
        </div>

        {error && <p style={{ color:'#ff7070', fontSize:'.85rem', marginTop:'12px', textAlign:'center', fontStyle:'italic' }}>✦ {error}</p>}

        <button style={S.btn(loading)} onClick={submit} disabled={loading}>
          {loading ? 'AWAKENING...' : (mode==='login' ? '🔥 ENTER THE ABYSS' : '🔥 AWAKEN LUCIFER')}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type='text', onEnter }) {
  return (
    <div>
      <label style={{ fontFamily:"'Cinzel',serif", fontSize:'.52rem', letterSpacing:'3px', color:'rgba(212,175,55,.6)', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key==='Enter' && onEnter?.()}
        style={{ width:'100%', background:'rgba(5,0,0,.6)', border:'1px solid rgba(139,0,0,.4)', outline:'none', color:'#F5E6C8', fontFamily:"'EB Garamond',serif", fontSize:'1rem', padding:'10px 14px' }}
        onFocus={e => e.target.style.borderColor='rgba(255,69,0,.6)'}
        onBlur={e  => e.target.style.borderColor='rgba(139,0,0,.4)'}
      />
    </div>
  );
}
