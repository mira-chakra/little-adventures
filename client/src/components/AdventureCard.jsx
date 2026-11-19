import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Clock3, MapPin, Wallet } from 'lucide-react';
export function CoverArt({adventure,large=false}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[adventure?.imageUrl]);
  const cover=adventure?.cover||'mountains';
  const icons={mountains:'⛰',sea:'≈',forest:'♧',city:'✺',sunset:'☀',heritage:'⌂'};
  return <div className={`cover-art cover-${cover}${large?' cover-large':''}`}>
    {adventure?.imageUrl && !failed ? <img src={adventure.imageUrl} alt={`${adventure.title} location`} loading="lazy" onError={()=>setFailed(true)}/> : <><div className="cover-sun"/><div className="cover-hill cover-hill-back"/><div className="cover-hill cover-hill-front"/><span className="cover-glyph" aria-hidden="true">{icons[cover]}</span></>}
    {(!adventure?.imageUrl||failed)&&<span className="photo-missing">{failed?'Photo unavailable':'Photo not yet added'}</span>}
    <span className="cover-region">{adventure?.region || 'Lebanon'}</span>
  </div>;
}
export function AdventureCard({adventure,footer}) {
  return <article className="adventure-card"><Link to={`/adventures/${adventure._id}`} className="card-art-link" aria-label={`Explore ${adventure.title}`}><CoverArt adventure={adventure}/></Link>
    <div className="adventure-card-body"><div className="mood-row">{adventure.moods?.slice(0,2).map(m=><span className="mood-pill" key={m}>{m}</span>)}{typeof adventure.matchScore==='number'&&<span className="match-pill">Match score: {adventure.matchScore}</span>}</div>
    <h3><Link to={`/adventures/${adventure._id}`}>{adventure.title}</Link></h3><p className="card-location"><MapPin size={14}/>{adventure.location}</p>
    <div className="card-meta"><span><Wallet size={15}/> {adventure.costStatus==='unknown'?'Cost unverified':`$${adventure.estimatedCost}${adventure.costStatus==='verified'?'':' est.'}`}</span><span><Clock3 size={15}/>{formatDuration(adventure.durationMinutes)}</span></div>
    {adventure.imageUrl&&<p className="photo-credit">{adventure.imageSource?<a href={adventure.imageSource} target="_blank" rel="noreferrer">Photo: {adventure.imageCredit||'Source'}</a>:<>Photo: {adventure.imageCredit||'Credit pending'}</>} {adventure.imageLicense&&` · ${adventure.imageLicense}`}</p>}
    {adventure.matchReason&&<p className="match-reason">{adventure.matchReason}</p>}
    {footer || <Link className="card-detail-link" to={`/adventures/${adventure._id}`}>Discover adventure <ArrowUpRight size={17}/></Link>}</div>
  </article>;
}
export function formatDuration(minutes){const hours=Math.floor(minutes/60),left=minutes%60;return hours?(left?`${hours}h ${left}m`:`${hours}h`):`${left}m`;}
