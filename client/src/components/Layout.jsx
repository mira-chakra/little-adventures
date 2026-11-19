import { Link, NavLink, useNavigate } from 'react-router';
import { ArrowRight, Compass, Heart, LogOut, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';
export function Layout({children}) {
  const {user,logout}=useAuth(); const navigate=useNavigate();const [mobileOpen,setMobileOpen]=useState(false);
  async function signOut(){await logout();setMobileOpen(false);navigate('/');}
  const close=()=>setMobileOpen(false);
  return <div className="app-layout">
    <header className="site-header"><div className="shell header-row">
      <Link to="/" className="brand" aria-label="Little Adventures home" onClick={close}><span className="brand-mark">✳</span>little<span className="brand-light">adventures</span><span className="brand-dot">.</span></Link>
      <button type="button" className="mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen?<X size={23}/>:<Menu size={23}/>}</button>
      <nav className={mobileOpen?'open':''} aria-label="Main navigation">
        <NavLink to="/" end onClick={close}>Home</NavLink><NavLink to="/explore" onClick={close}>Explore</NavLink><NavLink to="/pick-for-me" onClick={close}>Pick for me</NavLink>
        {user&&<NavLink to="/favorites" onClick={close}><Heart size={15}/> Favorites</NavLink>}
        {user&&<><NavLink to="/history" onClick={close}>History</NavLink><NavLink to="/suggest" onClick={close}>Suggest a place</NavLink></>}
        {user?.role==='admin'&&<NavLink to="/admin" onClick={close}><ShieldCheck size={15}/> Admin</NavLink>}
        {user ? <button className="logout-button" onClick={signOut} title="Log out"><LogOut size={16}/> Log out</button> : <NavLink to="/login" className="login-link" onClick={close}>Log in <ArrowRight size={15}/></NavLink>}
      </nav>
    </div></header>
    <main id="main-content" className="main-content">{children}</main>
    <footer><div className="shell footer-row"><Link to="/" className="footer-brand">littleadventures<span className="brand-dot">.</span></Link><span>Made for curious days in Lebanon · A university capstone project</span><span>Explore a little, live a lot. <Sparkles size={13}/></span></div></footer>
  </div>;
}
export function PageHeading({eyebrow,title,description,children}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}{children}</div>;}
export function Loading(){return <div className="shell loading-state" role="status"><div className="spinner"/> Loading your adventures…</div>;}
export function Message({type='info',children}){return <div className={`message message-${type}`} role={type==='error'?'alert':'status'}>{children}</div>;}
export function Empty({icon=<Compass size={34}/>,title='Nothing here yet',text,action}){return <div className="empty-state">{icon}<h2>{title}</h2>{text&&<p>{text}</p>}{action}</div>;}
export function AuthRequired({children,admin=false}){
  const {user,loading}=useAuth();
  if(loading)return <Loading/>;
  if(!user)return <div className="shell auth-guard"><Empty title="You need to log in first" text="Create a free account to save adventures and manage your list." action={<Link className="button button-primary" to="/login">Log in <ArrowRight size={17}/></Link>}/></div>;
  if(admin && user.role!=='admin')return <div className="shell auth-guard"><Empty title="Admin access only" text="Only administrators can manage adventures." action={<Link to="/explore" className="button button-primary">Explore instead</Link>}/></div>;
  return children;
}
