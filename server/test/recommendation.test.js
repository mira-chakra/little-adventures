import test from 'node:test';
import assert from 'node:assert/strict';
import { rankAdventures } from '../src/utils/recommend.js';
import { seedAdventures } from '../src/utils/seedData.js';

test('seed list contains ten independent editable adventures',()=>{
  assert.equal(seedAdventures.length,10);
  assert.equal(new Set(seedAdventures.map(a=>a.title)).size,10);
  assert.ok(seedAdventures.every(a=>a.moods.length>0&&a.estimatedCost>=0&&a.durationMinutes>=30));
});
test('recommendations match mood, max cost and maximum available time',()=>{
  const actual=rankAdventures(seedAdventures,{mood:'relax',budget:15,availableMinutes:180});
  assert.ok(actual.length>0);
  assert.ok(actual.every(a=>a.moods.includes('relax')&&a.estimatedCost<=15&&a.durationMinutes<=180));
});
test('specific region is respected',()=>{
  const actual=rankAdventures(seedAdventures,{mood:'culture',budget:50,availableMinutes:500,region:'Mount Lebanon'});
  assert.ok(actual.length>0);
  assert.ok(actual.every(a=>a.region==='Mount Lebanon'));
});
test('zero budget never divides by zero',()=>{
  const actual=rankAdventures(seedAdventures,{mood:'relax',budget:0,availableMinutes:180});
  assert.ok(actual.length>0);
  assert.ok(actual.every(a=>Number.isFinite(a.matchScore)&&a.estimatedCost===0));
});
test('ranking prefers cheaper, shorter outings if mood and constraints match',()=>{
  const items=[
    {title:'long expensive',moods:['nature'],region:'Beirut',estimatedCost:20,durationMinutes:240},
    {title:'short affordable',moods:['nature'],region:'Beirut',estimatedCost:5,durationMinutes:60}
  ];
  const ranked=rankAdventures(items,{mood:'nature',budget:30,availableMinutes:360});
  assert.deepEqual(ranked.map(x=>x.title),['short affordable','long expensive']);
});
