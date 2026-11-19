// Fixed upstream host: clients can never request arbitrary URLs through this service.
const cache = new Map();
export const todayBeirut = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Beirut',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function validForecastDate(date) {
  const difference=(Date.parse(date)-Date.parse(todayBeirut()))/86400000;
  return Number.isInteger(difference) && difference>=0 && difference<7;
}
export function weatherLabel(code) {
  if(code===0)return 'Clear'; if(code<=3)return 'Partly cloudy / cloudy';
  if(code<=48)return 'Fog';if(code<=67)return 'Rain / drizzle';
  if(code<=77)return 'Snow';if(code<=82)return 'Rain showers';if(code<=86)return 'Snow showers';
  return 'Thunderstorms';
}
export function weatherConcern(w) {
  return w?.available && ((w.rainChance??0)>=60 || (w.wind??0)>=35 || [95,96,99].includes(w.code));
}
export async function forecasts(items,date=todayBeirut(),fetcher=fetch) {
  const result=new Map();
  if(!validForecastDate(date))return result;
  const missing=new Map();
  for(const item of items){
    if(!Number.isFinite(item.latitude)||!Number.isFinite(item.longitude))continue;
    const key=`${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}:${date}`;
    const hit=cache.get(key);
    if(hit && hit.expires>Date.now())result.set(String(item._id),hit.value);
    else {const entry=missing.get(key)||{key,latitude:item.latitude,longitude:item.longitude,ids:[]};entry.ids.push(String(item._id));missing.set(key,entry);}
  }
  const locations=[...missing.values()];
  const batches=[];for(let i=0;i<locations.length;i+=50)batches.push(locations.slice(i,i+50));
  // Batch coordinates to avoid one HTTP request per card. At most four requests at once.
  for(let i=0;i<batches.length;i+=4)await Promise.all(batches.slice(i,i+4).map(async batch=>{
    try{
      const query=new URLSearchParams({latitude:batch.map(x=>x.latitude).join(','),longitude:batch.map(x=>x.longitude).join(','),daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',timezone:'Asia/Beirut',forecast_days:'7'});
      const response=await fetcher(`https://api.open-meteo.com/v1/forecast?${query}`,{signal:AbortSignal.timeout(5000)});
      if(!response.ok)throw new Error('Forecast unavailable');
      const json=await response.json();const rows=Array.isArray(json)?json:[json];
      batch.forEach((place,index)=>{
        const daily=rows[index]?.daily;const day=daily?.time?.indexOf(date)??-1;if(day<0)return;
        const value={available:true,date,low:daily.temperature_2m_min?.[day]??null,high:daily.temperature_2m_max?.[day]??null,rainChance:daily.precipitation_probability_max?.[day]??null,wind:daily.wind_speed_10m_max?.[day]??null,code:daily.weather_code?.[day]??null,checkedAt:new Date().toISOString()};
        value.label=value.code===null?'Forecast':weatherLabel(value.code);
        if(cache.size>=500)cache.delete(cache.keys().next().value);
        cache.set(place.key,{value,expires:Date.now()+30*60*1000});for(const id of place.ids)result.set(id,value);
      });
    }catch{/* Weather is optional; unavailable is never represented as sunny or zero rain. */}
  }));
  return result;
}
