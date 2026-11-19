import { useEffect,useState } from 'react';
import { Link } from 'react-router';
import { api } from '../lib/api.js';
import { Empty,Loading,Message,PageHeading } from '../components/Layout.jsx';
import VisitForm from '../components/VisitForm.jsx';
export default function History(){
 const [visits,setVisits]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0),[busy,setBusy]=useState('');
 useEffect(()=>{let active=true;api('/history').then(d=>{if(active)setVisits(d.visits);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[revision]);
 async function remove(id){setBusy(id);setError('');try{await api(`/history/${id}`,{method:'DELETE'});setVisits(v=>v.filter(x=>x.adventure._id!==id));}catch(e){setError(e.message);}finally{setBusy('');}}
 return <section className="shell page-section"><PageHeading eyebrow="YOUR LITTLE MEMORIES" title="My adventure history" description="Places you have visited. Add or update an optional visit date; saving a visit again updates the same entry."/>
 {error&&<Message type="error">{error}</Message>}{loading?<Loading/>:visits.length?<div className="community-list">{visits.map(v=><article className="info-panel" key={v._id}><h2><Link to={`/adventures/${v.adventure._id}`}>{v.adventure.title}</Link></h2><p>{v.adventure.location} · {v.visitedOn?`Visited on ${v.visitedOn}`:'Visited — date not recorded'}</p><VisitForm key={`${v._id}-${v.visitedOn}`} id={v.adventure._id} initialDate={v.visitedOn} onSaved={()=>setRevision(n=>n+1)}/><button className="button button-quiet danger" disabled={busy===v.adventure._id} onClick={()=>remove(v.adventure._id)}>Remove from history</button></article>)}</div>:<Empty title="Your story starts here" text="Open an adventure and select Save as visited, or mark a favorite as visited." action={<Link to="/explore" className="button button-primary">Explore places</Link>}/>}
 </section>;
}
