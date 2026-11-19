import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../lib/api.js';
import { Empty, Loading, Message, PageHeading } from '../components/Layout.jsx';
import { categories,moods,regions } from '../lib/catalog.js';

function ImportPanel({onDone}){
  const [text,setText]=useState(''),[preview,setPreview]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function run(dryRun){setBusy(true);setError('');try{const records=JSON.parse(text);const result=await api('/adventures/import',{method:'POST',body:{records,dryRun}});setPreview(result);if(!dryRun)onDone();}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <details className="info-panel"><summary>Import a JSON catalogue (up to 100 places)</summary><p>Preview first. New records become drafts; duplicates by name and location are skipped. Existing records are never overwritten.</p><label className="field-label">Select JSON file<input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files[0];if(!file)return;if(file.size>900000){setError('File must be under 900 KB.');return;}setText(await file.text());setPreview(null);}}/></label><label className="field-label">Or paste a JSON array<textarea rows="5" value={text} onChange={e=>{setText(e.target.value);setPreview(null);}}/></label><div className="hero-actions"><button className="button button-quiet" disabled={busy||!text.trim()} onClick={()=>run(true)}>Preview import</button>{preview?.dryRun&&<button className="button button-primary" disabled={busy} onClick={()=>run(false)}>Import reviewed records as drafts</button>}</div>{error&&<Message type="error">{error}</Message>}{preview&&<><p>{preview.message}{!preview.dryRun&&` ${preview.inserted} records added.`}</p><ul className="import-preview">{preview.preview.map(row=><li key={row.row}>{row.title}: {row.action}</li>)}</ul></>}</details>;
}
export function AdminDashboard(){
  const [data,setData]=useState({adventures:[],pages:0,total:0}),[stats,setStats]=useState(null),[page,setPage]=useState(1),[revision,setRevision]=useState(0),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState('');
  useEffect(()=>{let active=true;setLoading(true);Promise.all([api(`/adventures/manage?page=${page}`),api('/admin/stats')]).then(([d,s])=>{if(active){setData(d);setStats(s);}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[page,revision]);
  async function remove(item){if(!window.confirm(`Delete "${item.title}" and its favorites?`))return;setBusy(item._id);setError('');try{await api(`/adventures/${item._id}`,{method:'DELETE'});if(data.adventures.length===1&&page>1)setPage(page-1);setRevision(x=>x+1);}catch(e){setError(e.message);}finally{setBusy('');}}
  return <section className="shell page-section"><div className="admin-heading"><PageHeading eyebrow="CATALOGUE STUDIO" title="Manage places" description="Keep photos, sources and practical information up to date. Publish reviewed drafts when ready."/><Link className="button button-primary" to="/admin/new">Add a place</Link></div><p><Link className="button button-quiet" to="/admin/review">Review user suggestions</Link></p><ImportPanel onDone={()=>{setPage(1);setRevision(x=>x+1);}}/>
    {error&&<Message type="error">{error}</Message>}{loading?<Loading/>:<><div className="admin-stats"><div><strong>{stats?.adventures??data.total}</strong> Places including drafts</div><div><strong>{stats?.users??0}</strong> Accounts</div><div><strong>{stats?.favorites??0}</strong> Favorites</div></div>
      {data.adventures.length?<div className="admin-list">{data.adventures.map(a=><div className="admin-item" key={a._id}><div className="admin-item-info"><strong>{a.title}</strong><span>{a.region} · {a.status||'published'} · {a.imageUrl?'Photo added':'Photo missing'}</span></div><Link className="button button-quiet" to={`/admin/edit/${a._id}`}>Edit</Link><button className="button button-quiet danger" disabled={busy===a._id} onClick={()=>remove(a)}>Delete</button></div>)}</div>:<Empty title="No places yet" text="Add a place or import a reviewed catalogue."/>}
      {data.pages>1&&<nav className="pagination"><button className="button button-quiet" disabled={page===1} onClick={()=>setPage(x=>x-1)}>Previous</button><span>Page {page} of {data.pages}</span><button className="button button-quiet" disabled={page>=data.pages} onClick={()=>setPage(x=>x+1)}>Next</button></nav>}</>}
  </section>;
}
const initial={title:'',description:'',region:'',location:'',estimatedCost:'0',durationMinutes:'120',moods:['nature'],cover:'mountains',imageUrl:'',tips:'',category:'other',district:'',environment:'unknown',difficulty:'unknown',latitude:'',longitude:'',costStatus:'unknown',activities:'',bestSeason:'',openingHours:'',bookingUrl:'',sourceUrl:'',checkedOn:'',imageCredit:'',imageSource:'',imageLicense:'',status:'draft'};
export function AdminForm(){
  const {id}=useParams(),editing=Boolean(id),navigate=useNavigate();const [form,setForm]=useState(initial),[loading,setLoading]=useState(editing),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loadFailed,setLoadFailed]=useState(false);
  useEffect(()=>{if(!editing)return;let active=true;api(`/adventures/manage/${id}`).then(d=>{if(active){const values={...initial,...d.adventure};for(const key of ['latitude','longitude'])values[key]=values[key]??'';setForm(values);}}).catch(e=>{if(active){setError(e.message);setLoadFailed(true);}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id,editing]);
  const update=(key,value)=>setForm(f=>({...f,[key]:value}));
  function input(key,label,type='text',extra={}){return <label key={key}>{label}<input type={type} value={form[key]} onChange={e=>update(key,e.target.value)} {...extra}/></label>;}
  function select(key,label,options){return <label key={key}>{label}<select value={form[key]} onChange={e=>update(key,e.target.value)}>{options.map(x=><option key={x} value={x}>{x}</option>)}</select></label>;}
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{
    if((form.latitude==='')!==(form.longitude===''))throw new Error('Provide both coordinates or leave both blank.');
    const body=Object.fromEntries(Object.keys(initial).map(key=>[key,form[key]]));
    body.estimatedCost=Number(body.estimatedCost);body.durationMinutes=Number(body.durationMinutes);
    for(const key of ['latitude','longitude'])body[key]=body[key]===''?null:Number(body[key]);
    await api(editing?`/adventures/${id}`:'/adventures',{method:editing?'PATCH':'POST',body});navigate('/admin');
  }catch(e){setError(e.message);}finally{setBusy(false);}}
  if(loading)return <Loading/>;
  if(loadFailed)return <section className="shell page-section"><Message type="error">{error}</Message><Link to="/admin">Back to admin</Link></section>;
  return <section className="shell page-section admin-form-page"><Link to="/admin" className="back-link">← Back to admin</Link><PageHeading eyebrow="PLACE EDITOR" title={editing?'Edit place':'Add place'} description="Use exact-location photos you have permission to use. Leave unverified practical details blank."/>
    <form className="admin-form" onSubmit={submit}><div className="admin-form-grid">
      {input('title','Place / adventure name','text',{required:true,minLength:3,maxLength:100})}
      {select('status','Visibility',['draft','pending','published','rejected'])}
      <label className="full-field">Description<textarea rows="4" required minLength="20" maxLength="1100" value={form.description} onChange={e=>update('description',e.target.value)}/></label>
      <label>Region<input list="regions" required minLength="2" maxLength="75" value={form.region} onChange={e=>update('region',e.target.value)}/><datalist id="regions">{regions.map(r=><option key={r}>{r}</option>)}</datalist></label>
      {input('district','District','text',{maxLength:90})}{input('location','Town / location','text',{required:true,minLength:2,maxLength:90})}
      {select('category','Category',categories)}{select('environment','Setting',['unknown','indoor','outdoor','mixed'])}{select('difficulty','Difficulty',['unknown','easy','moderate','hard'])}
      {input('estimatedCost','Planning cost per person ($)','number',{min:0,max:1000,step:'0.01',required:true})}{select('costStatus','Cost reliability',['unknown','estimate','verified'])}
      {input('durationMinutes','Activity time, excluding travel (minutes)','number',{min:30,max:1440,required:true})}
      {input('latitude','Latitude (optional)','number',{min:-90,max:90,step:'any'})}{input('longitude','Longitude (optional)','number',{min:-180,max:180,step:'any'})}
      <fieldset className="full-field"><legend>Moods (1–4)</legend><div className="mood-checkboxes">{moods.map(m=><label key={m}><input type="checkbox" checked={form.moods.includes(m)} onChange={()=>update('moods',form.moods.includes(m)?form.moods.filter(x=>x!==m):[...form.moods,m])}/>{m}</label>)}</div></fieldset>
      {input('imageUrl','Real photo URL (HTTPS or /photos/file.jpg)','text',{maxLength:2000})}{input('imageCredit','Photographer / credit','text',{maxLength:600})}
      {input('imageSource','Photo source page (HTTPS)','url',{maxLength:2000})}{input('imageLicense','Photo licence','text',{maxLength:150})}
      {select('cover','Fallback illustration',['mountains','sea','forest','city','sunset','heritage'])}
      {input('sourceUrl','Place information source (HTTPS)','url',{maxLength:2000})}{input('bookingUrl','Venue / booking website (HTTPS)','url',{maxLength:2000})}
      {input('checkedOn','Date you checked practical details','date')}{input('openingHours','Opening hours (leave blank if unknown)','text',{maxLength:250})}{input('bestSeason','Season / conditions','text',{maxLength:200})}
      <label className="full-field">Things to do<textarea maxLength="1000" rows="3" value={form.activities} onChange={e=>update('activities',e.target.value)}/></label>
      <label className="full-field">Helpful tips<textarea maxLength="350" rows="3" value={form.tips} onChange={e=>update('tips',e.target.value)}/></label>
    </div>{error&&<Message type="error">{error}</Message>}<div className="form-actions"><button className="button button-primary" disabled={busy||form.moods.length<1||form.moods.length>4}>{busy?'Saving…':'Save place'}</button><Link className="button button-quiet" to="/admin">Cancel</Link></div></form>
  </section>;
}
