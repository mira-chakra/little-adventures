import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart, Trash2, CheckCircle2, Compass } from 'lucide-react';
import { api } from '../lib/api.js';
import { AdventureCard } from '../components/AdventureCard.jsx';
import { Empty, Loading, Message, PageHeading } from '../components/Layout.jsx';
import { useAuth } from '../lib/AuthContext.jsx';
export default function Favorites(){const {user}=useAuth();const [favorites,setFavorites]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{api('/favorites').then(d=>setFavorites(d.favorites)).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  async function remove(id){try{await api(`/favorites/${id}`,{method:'DELETE'});setFavorites(f=>f.filter(item=>item.adventure._id!==id));}catch(e){setError(e.message);}}
  async function changeVisited(item){try{await api(`/favorites/${item.adventure._id}`,{method:'PATCH',body:{visited:!item.visited}});setFavorites(f=>f.map(x=>x._id===item._id?{...x,visited:!x.visited}:x));}catch(e){setError(e.message);}}
  return <section className="shell page-section"><PageHeading eyebrow="YOUR PERSONAL COLLECTION" title={<>Saved with <em>love.</em></>} description={`Hi ${user?.name?.split(' ')[0]||'there'}! Keep your ideas for the next free weekend, and tick off the ones you've tried.`}/>
    <p><Link to="/history">View adventure history and add visit dates →</Link></p>
    {error&&<Message type="error">{error}</Message>}{loading?<Loading/>:favorites.length?<><div className="results-head"><h2>{favorites.length} saved adventures</h2><p>{favorites.filter(f=>f.visited).length} marked as visited</p></div><div className="adventure-grid">{favorites.map(f=><AdventureCard key={f._id} adventure={f.adventure} footer={<div className="favorite-actions"><button type="button" onClick={()=>changeVisited(f)} className={`visited-button${f.visited?' visited':''}`} aria-label={f.visited?'Mark as not visited':'Mark as visited'}><CheckCircle2 size={17}/>{f.visited?'Visited':'Mark visited'}</button><button type="button" onClick={()=>remove(f.adventure._id)} className="remove-button" aria-label={`Remove ${f.adventure.title} from favorites`}><Trash2 size={16}/></button></div>}/>)}</div></>:<Empty icon={<Heart size={36}/>} title="No saved adventures yet" text="Find a place that sparks your curiosity and save it for later." action={<Link className="button button-primary" to="/explore">Explore adventures <Compass size={17}/></Link>}/>}
  </section>;
}
