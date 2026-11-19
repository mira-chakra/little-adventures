export const categories=['heritage','museum','village','beach','waterfront','hiking','reserve','waterfall','viewpoint','food','park','religious','other'];
export const moods=['nature','relax','culture','food','adventure','romantic'];
export const regions=['Beirut','Mount Lebanon','Keserwan-Jbeil','North Lebanon','Akkar','South Lebanon','Nabatieh','Bekaa','Baalbek-Hermel'];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Beirut',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function lastForecastDay(){const date=new Date(today()+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+6);return date.toISOString().slice(0,10);}
