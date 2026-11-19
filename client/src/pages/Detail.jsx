import VisitForm from '../components/VisitForm.jsx';
import PlaceExtras from '../components/PlaceExtras.jsx';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Clock3, Heart, MapPin, Wallet, Lightbulb } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { CoverArt, formatDuration } from '../components/AdventureCard.jsx';
import { Empty, Loading, Message } from '../components/Layout.jsx';
export default function Detail(){const {id}=useParams();const {user}=useAuth();const navigate=useNavigate();const [item,setItem]=useState(null);const [saved,setSaved]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;setLoading(true);api('/adventures/'+id).then(d=>{if(active)setItem(d.adventure);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id]);
  useEffect(()=>{let active=true;if(user)api('/favorites').then(d=>{if(active)setSaved(d.favorites.some(f=>f.adventure?._id===id));}).catch(()=>{});return()=>{active=false;};},[id,user]);
  async function toggle(){if(!user){navigate('/login');return;}setBusy(true);setError('');try{await api(saved?`/favorites/${id}`:'/favorites',{method:saved?'DELETE':'POST',...(saved?{}:{body:{adventureId:id}})});setSaved(!saved);setNotice(saved?'Removed from your favorites.':'Saved to your favorites!');}catch(e){setError(e.message);}finally{setBusy(false);}}
  if(loading)return <Loading/>;
  if(!item)return <div className="shell page-section"><Empty title="Adventure unavailable" text={error||'This adventure may have been removed.'} action={<Link className="button button-primary" to="/explore">Back to Explore</Link>}/></div>;
  return <section className="shell detail-layout"><Link className="back-link" to="/explore"><ArrowLeft size={18}/> All adventures</Link>
    <div className="detail-grid"><div><CoverArt adventure={item} large/></div><div className="detail-info"><span className="eyebrow">A LITTLE ADVENTURE IN {item.region.toUpperCase()}</span><h1>{item.title}</h1><div className="detail-location"><MapPin size={19}/>{item.location}</div><div className="mood-row">{item.moods.map(m=><span className="mood-pill" key={m}>{m}</span>)}</div>
      <p className="detail-description">{item.description}</p><div className="detail-stats"><div><Wallet size={21}/><small>Estimated cost</small><strong>{item.costStatus==='unknown'?'Unverified':`$${item.estimatedCost}`}</strong></div><div><Clock3 size={21}/><small>Time needed</small><strong>{formatDuration(item.durationMinutes)}</strong></div></div>
      {item.tips&&<div className="tip-card"><Lightbulb size={19}/><span><strong>Little tip</strong>{item.tips}</span></div>}
      {error&&<Message type="error">{error}</Message>}{notice&&<Message type="success">{notice}</Message>}
      <div className="hero-actions"><button type="button" className="button button-primary" onClick={toggle} disabled={busy}><Heart size={18} fill={saved?'currentColor':'none'}/>{saved?'Saved!':'Save to favorites'}</button><Link className="button button-quiet" to="/pick-for-me">More suggestions <ArrowRight size={18}/></Link></div><p className="detail-disclaimer">Estimates and availability can change. Check local conditions before visiting.</p>
    </div></div>
    {user&&<div className="info-panel"><h2>Been here?</h2><VisitForm key={id} id={id}/><Link to="/history">View my adventure history →</Link></div>}
    <PlaceExtras item={item}/>
  </section>;
}
