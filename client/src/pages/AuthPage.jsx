import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { ArrowRight, LockKeyhole, Mail, UserRound, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext.jsx';
import { Message } from '../components/Layout.jsx';
export default function AuthPage({signup=false}) {const {user,login,register}=useAuth();const navigate=useNavigate();const [form,setForm]=useState({name:'',email:'',password:''});const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  if(user)return <Navigate to={user.role==='admin'?'/admin':'/favorites'} replace/>;
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{const result=await (signup?register(form):login({email:form.email,password:form.password}));navigate(result.role==='admin'?'/admin':'/favorites',{replace:true});}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <section className="auth-page"><div className="auth-deco"><div className="auth-deco-inner"><div className="deco-star">✳</div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Adventure looks<br/>better <em>together.</em></h2><p>Find your next escape. Save your favorite spots. Make the most of a little free time.</p><Sparkles size={34}/></div></div><div className="auth-panel"><div className="auth-panel-inner"><span className="eyebrow">{signup?'JOIN THE ADVENTURE':'WELCOME BACK'}</span><h1>{signup?'Create an account':'Log in to your world'}</h1><p>{signup?'Your next little escape starts here.':'Your saved adventures are waiting for you.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {signup&&<label><span><UserRound size={16}/> Your name</span><input type="text" value={form.name} minLength={2} maxLength={70} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="Your name" autoComplete="name"/></label>}
      <label><span><Mail size={16}/> Email address</span><input type="email" value={form.email} maxLength={254} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required placeholder="you@example.com" autoComplete="email"/></label>
      <label><span><LockKeyhole size={16}/> Password</span><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={signup?8:1} maxLength={72} placeholder={signup?'8+ chars, uppercase, lowercase & number':'Your password'} autoComplete={signup?'new-password':'current-password'}/></label>
      {error&&<Message type="error">{error}</Message>}
      <button className="button button-primary full-width" type="submit" disabled={busy}>{busy?'Just a moment…':signup?'Create account':'Log in'} <ArrowRight size={18}/></button>
    </form><p className="auth-switch">{signup?'Already have an account?':'New here?'} <Link to={signup?'/login':'/signup'}>{signup?'Log in':'Create a free account'}</Link></p>
    <p className="auth-smallprint">We use secure, HttpOnly cookies for sessions. Your password is never stored as plain text.</p></div></div></section>;
}
