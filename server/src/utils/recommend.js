import { weatherConcern } from './weather.js';
export function distanceKm(lat1,lon1,lat2,lon2){
  const rad=n=>n*Math.PI/180;const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));
}
export function rankAdventures(adventures,preferences) {
  const {budget,availableMinutes,region='',environment='',difficulty='',latitude,longitude}=preferences;
  const wanted=preferences.moods?.length?preferences.moods:preferences.mood?[preferences.mood]:[];
  return adventures.filter(item=>(!item.status || item.status==='published') && item.costStatus!=='unknown')
    .filter(item=>item.estimatedCost<=budget && item.durationMinutes<=availableMinutes)
    .filter(item=>!wanted.length || wanted.some(m=>item.moods.includes(m)))
    .filter(item=>!region || item.region.toLowerCase()===region.toLowerCase())
    .filter(item=>!environment || item.environment===environment)
    .filter(item=>!difficulty || item.difficulty===difficulty)
    .map(item=>{
      const matches=wanted.filter(m=>item.moods.includes(m));
      let score=60*(wanted.length?matches.length/wanted.length:1)+(budget===0?20:20*(1-item.estimatedCost/budget))+20*(1-item.durationMinutes/availableMinutes);
      const reasons=[matches.length?matches.join(' + '):'Fits your preferences',`estimated cost within $${budget}`,`activity fits ${availableMinutes} min`];
      let distance=null;
      if([latitude,longitude,item.latitude,item.longitude].every(Number.isFinite)){
        distance=distanceKm(latitude,longitude,item.latitude,item.longitude);score+=15/(1+distance/20);reasons.push(`${distance.toFixed(1)} km straight-line distance`);
      }
      if(preferences.useWeather){
        if(!item.weather?.available)reasons.push('forecast unavailable');
        else if(weatherConcern(item.weather)){
          if(item.environment==='indoor'){score+=10;reasons.push('indoor option in forecast rain/wind');}
          else if(['outdoor','mixed'].includes(item.environment)){score-=25;reasons.push('rain/wind forecast — check outdoor plans');}
        }else reasons.push(`${item.weather.label.toLowerCase()} forecast`);
      }
      return {...item,distanceKm:distance,matchScore:Math.round(Math.max(0,score)),matchReason:reasons.join(' · ')};
    }).sort((a,b)=>b.matchScore-a.matchScore || a.estimatedCost-b.estimatedCost || a.title.localeCompare(b.title));
}
