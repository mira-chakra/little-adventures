import { useEffect,useState } from 'react';
import { Link } from 'react-router';
import { api } from '../lib/api.js';
import { moods } from '../lib/catalog.js';
import { Loading,Message,PageHeading } from '../components/Layout.jsx';
const initial={title:'',description:'',region:'',location:'',estimatedCost:'0',durationMinutes:'60',moods:['nature'],sourceUrl:'',latitude:'',longitude:''};
export default function Submissions(){
 const [form,setForm]=useState(initial),[items,setItems]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let active=true;api('/submissions').then(d=>{if(active)setItems(d.submissions);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const update=(key,value)=>setForm(f=>({...f,[key]:value}));
 async function submit(e){e.preventDefault();setBusy(true);setError('');setNotice('');try{
 if((form.latitude==='')!==(form.longitude===''))throw new Error('Provide both coordinates or leave both blank.');
 const body={...form,estimatedCost:Number(form.estimatedCost),durationMinutes:Number(form.durationMinutes),latitude:form.latitude===''?null:Number(form.latitude),longitude:form.longitude===''?null:Number(form.longitude)};
 const d=await api('/submissions',{method:'POST',body});setItems(x=>[d.submission,...x]);setForm(initial);setNotice('Suggestion submitted! An admin must approve it before it appears in Explore.');
 }catch(e){setError(e.message);}finally{setBusy(false);}}
 const input=(key,label,type='text',attrs={})=><label key={key}>{label}<input type={type} value={form[key]} onChange={e=>update(key,e.target.value)} {...attrs}/></label>;
 return <section className="shell page-section"><PageHeading eyebrow="SHARE A LITTLE DISCOVERY" title="Suggest an adventure" description="Know a place worth exploring? Send its details for admin review. Your suggestion stays private until approved."/>
 <form className="admin-form" onSubmit={submit}><div className="admin-form-grid">
 {input('title','Place name','text',{required:true,minLength:3,maxLength:100})}{input('region','Region','text',{required:true,minLength:2,maxLength:75})}{input('location','Town / location','text',{required:true,minLength:2,maxLength:90})}
 <label className="full-field">Description<textarea required minLength={20} maxLength={1100} value={form.description} onChange={e=>update('description',e.target.value)}/></label>
 {input('estimatedCost','Estimated cost per person ($)','number',{required:true,min:0,max:1000,step:'0.01'})}{input('durationMinutes','Activity duration (minutes)','number',{required:true,min:30,max:1440})}
 <label>Mood<select value={form.moods[0]} onChange={e=>update('moods',[e.target.value])}>{moods.map(m=><option key={m}>{m}</option>)}</select></label>
 {input('sourceUrl','Information source (optional HTTPS link)','url',{maxLength:2000})}{input('latitude','Latitude (optional)','number',{min:-90,max:90,step:'any'})}{input('longitude','Longitude (optional)','number',{min:-180,max:180,step:'any'})}
 </div><button className="button button-primary" disabled={busy}>{busy?'Submitting…':'Submit for review'}</button></form>
 {error&&<Message type="error">{error}</Message>}{notice&&<Message>{notice}</Message>}
 <h2 className="community-heading">My suggestions</h2>{loading?<Loading/>:items.length?<div className="community-list">{items.map(item=><article className="info-panel" key={item._id}><h3>{item.title}</h3><p><strong>{({pending:'Pending review',rejected:'Rejected',published:'Approved',draft:'Under admin editing'})[item.status]}</strong> · {item.location}</p>{item.reviewReason&&<p>Admin feedback: {item.reviewReason}</p>}{item.status==='published'&&<Link to={`/adventures/${item._id}`}>View published adventure →</Link>}</article>)}</div>:<p>You have not suggested a place yet.</p>}
 </section>;
}
