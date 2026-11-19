import { useState } from 'react';
import { api } from '../lib/api.js';
import { AdventureCard } from '../components/AdventureCard.jsx';
import { Empty, Message, PageHeading } from '../components/Layout.jsx';
import { moods,regions,today,lastForecastDay } from '../lib/catalog.js';
export default function PickForMe(){
  const [form,setForm]=useState({moods:['nature'],budget:'30',availableMinutes:'240',region:'',environment:'',difficulty:'',date:today(),useWeather:true,latitude:null,longitude:null});
  const [results,setResults]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[submitted,setSubmitted]=useState(null),[locationMessage,setLocationMessage]=useState('');
  const update=(k,v)=>setForm(f=>({...f,[k]:v}));
  async function search(body,append=false){setLoading(true);setError('');try{const d=await api('/adventures/recommend',{method:'POST',body});setResults(old=>append?{...d,recommendations:[...old.recommendations,...d.recommendations]}:d);}catch(e){setError(e.message);}finally{setLoading(false);}}
  function submit(e){e.preventDefault();const body={...form,budget:Number(form.budget),availableMinutes:Number(form.availableMinutes),page:1};setSubmitted(body);setResults(null);search(body);}
  function locate(){if(!navigator.geolocation){setLocationMessage('Location is unavailable in this browser.');return;}setLocationMessage('Requesting location…');navigator.geolocation.getCurrentPosition(position=>{setForm(f=>({...f,latitude:position.coords.latitude,longitude:position.coords.longitude}));setLocationMessage('Location added for straight-line distance ranking.');},()=>setLocationMessage('Location unavailable or declined. You can still choose a region.'),{timeout:10000,maximumAge:300000});}
  return <section className="shell page-section"><PageHeading eyebrow="BUILD YOUR KIND OF DAY" title="Pick for me" description="Choose several interests, a budget and a date. Get explained suggestions, with optional distance and weather."/>
    <div className="recommend-layout"><form className="recommend-form" onSubmit={submit}><h2>Your preferences</h2>
      <fieldset><legend>Interests (choose one or more)</legend><div className="mood-checkboxes">{moods.map(m=><label key={m}><input type="checkbox" checked={form.moods.includes(m)} onChange={()=>update('moods',form.moods.includes(m)?form.moods.filter(x=>x!==m):[...form.moods,m])}/>{m}</label>)}</div></fieldset>
      <label className="field-label">Maximum estimated activity budget ($)<input required type="number" min="0" max="1000" value={form.budget} onChange={e=>update('budget',e.target.value)}/></label>
      <label className="field-label">Activity time (minutes, excluding travel)<input required type="number" min="30" max="1440" step="30" value={form.availableMinutes} onChange={e=>update('availableMinutes',e.target.value)}/></label>
      {[['region','Region',regions],['environment','Setting',['indoor','outdoor','mixed']],['difficulty','Difficulty',['easy','moderate','hard']]].map(([key,label,options])=><label className="field-label" key={key}>{label}<select value={form[key]} onChange={e=>update(key,e.target.value)}><option value="">Any</option>{options.map(x=><option key={x}>{x}</option>)}</select></label>)}
      <label className="field-label">Visit date<input required type="date" min={today()} max={form.useWeather?lastForecastDay():undefined} value={form.date} onChange={e=>update('date',e.target.value)}/></label>
      <label className="check-line"><input type="checkbox" checked={form.useWeather} onChange={e=>update('useWeather',e.target.checked)}/> Consider the forecast (next 7 days)</label>
      <button type="button" className="button button-quiet" onClick={locate}>Use my location</button>{form.latitude!==null&&<button type="button" className="button button-quiet" onClick={()=>{setForm(f=>({...f,latitude:null,longitude:null}));setLocationMessage('Location removed.');}}>Clear location</button>}
      <p className="subtle">{locationMessage||'Optional: location is used for this request, not saved to your account.'}</p>
      <button className="button button-primary" disabled={loading||!form.moods.length}>{loading?'Finding matches…':'Find my adventures'}</button>
      <p className="subtle">Ranking uses interests, estimated cost, duration, optional straight-line distance and forecast. It is not an AI probability or a driving-time estimate. Unknown costs are excluded.</p>
    </form><div className="recommend-results">{error&&<Message type="error">{error}</Message>}{results?results.recommendations.length?<><h2>{results.totalMatches} matching adventures</h2><div className="recommend-cards">{results.recommendations.map(a=><AdventureCard key={a._id} adventure={a}/>)}</div>{results.page<results.pages&&<button className="button button-primary" disabled={loading} onClick={()=>search({...submitted,page:results.page+1},true)}>{loading?'Loading…':'Show more suggestions'}</button>}</>:<Empty title="No exact matches" text="Try another region, fewer preferences or a larger budget. We never silently exceed your filters."/>:<Empty title={loading?'Finding your places…':'Your next outing starts here'} text="Tell us what you enjoy. Suggestions and the reasons behind them will appear here."/>}</div></div>
  </section>;
}
