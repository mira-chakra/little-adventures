import { useState } from 'react';
import { api } from '../lib/api.js';
import { today } from '../lib/catalog.js';
import { Message } from './Layout.jsx';
export default function VisitForm({id,initialDate='',onSaved}) {
 const [date,setDate]=useState(initialDate||''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function save(e){e.preventDefault();setBusy(true);setError('');setNotice('');try{await api(`/history/${id}`,{method:'PUT',body:{visitedOn:date||null}});setNotice('Saved to your adventure history.');onSaved?.();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <form className="visit-form" onSubmit={save}><label>Visit date (optional)<input type="date" max={today()} value={date} onChange={e=>setDate(e.target.value)}/></label><button className="button button-quiet" disabled={busy}>{busy?'Saving…':'Save as visited'}</button>{error&&<Message type="error">{error}</Message>}{notice&&<Message>{notice}</Message>}</form>;
}
