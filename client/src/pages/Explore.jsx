import { lazy, Suspense, useEffect, useState } from 'react';
import { api, queryString } from '../lib/api.js';
import { AdventureCard } from '../components/AdventureCard.jsx';
import { Empty, Loading, Message, PageHeading } from '../components/Layout.jsx';
import { categories,moods,regions } from '../lib/catalog.js';
import { loadMapResults } from '../lib/mapResults.js';
const AdventureMap = lazy(() => import('../components/AdventureMap.jsx'));
const initial={q:'',region:'',mood:'',category:'',environment:'',difficulty:'',maxCost:'',maxMinutes:'',page:1};
export default function Explore(){
  const [view,setView]=useState('list');
  const [filters,setFilters]=useState(initial),[applied,setApplied]=useState(initial),[data,setData]=useState({adventures:[],total:0,pages:0}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[regionOptions,setRegions]=useState(regions);
  useEffect(()=>{api('/adventures/options').then(d=>setRegions([...new Set([...regions,...d.regions])].sort())).catch(()=>{});},[]);
  useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');(view==='map' ? loadMapResults(applied,controller.signal) : api('/adventures'+queryString(applied),{signal:controller.signal})).then(d=>{if(!controller.signal.aborted)setData(d);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[applied,view]);
  const update=(key,value)=>setFilters(f=>({...f,[key]:value}));
  const select=(key,label,options)=><label key={key}>{label}<select value={filters[key]} onChange={e=>update(key,e.target.value)}><option value="">Any</option>{options.map(v=><option key={v} value={v}>{v}</option>)}</select></label>;
  return <section className="shell page-section"><PageHeading eyebrow="YOUR LEBANON, YOUR PACE" title="Explore adventures" description="Discover coastal walks, mountain escapes and cultural places. Find something that fits your day."/>
    <form className="catalog-filters" onSubmit={e=>{e.preventDefault();setApplied({...filters,page:1});}}>
      <label className="wide">Search places<input value={filters.q} onChange={e=>update('q',e.target.value)} placeholder="Town, district, place or activity" maxLength="100"/></label>
      {select('region','Region',regionOptions)}{select('category','Category',categories)}{select('mood','Mood',moods)}
      {select('environment','Setting',['indoor','outdoor','mixed'])}{select('difficulty','Difficulty',['easy','moderate','hard'])}
      <label>Max estimated cost ($)<input type="number" min="0" max="1000" value={filters.maxCost} onChange={e=>update('maxCost',e.target.value)} placeholder="Any"/></label>
      <label>Max activity time (min)<input type="number" min="30" max="1440" value={filters.maxMinutes} onChange={e=>update('maxMinutes',e.target.value)} placeholder="Any"/></label>
      <div className="filter-actions"><button className="button button-primary">Apply filters</button><button type="button" className="button button-quiet" onClick={()=>{setFilters(initial);setApplied({...initial});}}>Reset</button></div>
    </form>
    <div className="explore-view-switch" role="group" aria-label="Explore view">
      <button type="button" className={`button ${view==='list'?'button-primary':'button-quiet'}`} aria-pressed={view==='list'} onClick={()=>setView('list')}>List</button>
      <button type="button" className={`button ${view==='map'?'button-primary':'button-quiet'}`} aria-pressed={view==='map'} onClick={()=>setView('map')}>Map</button>
    </div>
    {error?<Message type="error">{error}</Message>:loading?<Loading/>:<><div className="results-head"><h2>{data.total} adventures to discover</h2><p>Costs are estimates unless marked verified. Travel is extra.</p></div>
      {data.adventures.length?(view==='map'?<Suspense fallback={<Loading/>}><AdventureMap adventures={data.adventures}/></Suspense>:<div className="adventure-grid">{data.adventures.map(a=><AdventureCard key={a._id} adventure={a}/>)}</div>):<Empty title="No places match yet" text="Try fewer filters. Places with unknown costs are excluded when you set a budget."/>}
      {view==='list'&&data.pages>1&&<nav className="pagination" aria-label="Results pages"><button className="button button-quiet" disabled={applied.page===1} onClick={()=>setApplied(f=>({...f,page:f.page-1}))}>Previous</button><span>Page {applied.page} of {data.pages}</span><button className="button button-quiet" disabled={applied.page>=data.pages} onClick={()=>setApplied(f=>({...f,page:f.page+1}))}>Next</button></nav>}</>}
  </section>;
}
