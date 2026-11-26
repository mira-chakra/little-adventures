import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { Adventure } from '../src/models/Adventure.js';
import { User } from '../src/models/User.js';
import { signToken } from '../src/middleware/auth.js';
import { adventureSchema, recommendSchema, updateAdventureSchema } from '../src/utils/validation.js';
import { forecasts,todayBeirut,validForecastDate } from '../src/utils/weather.js';
import { rankAdventures,distanceKm } from '../src/utils/recommend.js';
const sample={title:'A real place',description:'A detailed description of this place.',region:'Beirut',location:'Beirut',estimatedCost:10,durationMinutes:90,moods:['culture'],environment:'outdoor',latitude:33.9,longitude:35.5};
const write=r=>r.set('X-Requested-With','LittleAdventures');
test('partial update does not reset omitted new fields',()=>{
  assert.deepEqual(updateAdventureSchema.parse({title:'Renamed place'}),{title:'Renamed place'});
});
test('validation rejects script URLs, impossible coordinates, invalid dates and invalid categories',()=>{
  for(const changes of [{imageSource:'javascript:alert(1)'},{latitude:91},{checkedOn:'2026-02-31'},{category:'made-up'}])assert.equal(adventureSchema.safeParse({...sample,...changes}).success,false);
  assert.equal(recommendSchema.safeParse({budget:10,availableMinutes:60,date:'2026-02-31'}).success,false);
});
test('multi-interest ranking favors overlap and excludes drafts, unknown costs and hard constraint failures',()=>{
  const items=[{...sample,title:'One interest'},{...sample,title:'Two interests',moods:['culture','relax']},{...sample,title:'Draft',status:'draft'},{...sample,title:'Unknown cost',costStatus:'unknown'},{...sample,title:'Too expensive',estimatedCost:40}];
  const ranked=rankAdventures(items,{budget:20,availableMinutes:120,moods:['culture','relax']});
  assert.deepEqual(ranked.map(x=>x.title),['Two interests','One interest']);
});
test('weather changes outdoor ranking without relaxing budget or difficulty',()=>{
  const items=[{...sample,title:'Outside',difficulty:'easy',weather:{available:true,rainChance:90,wind:10,code:61}},{...sample,title:'Inside',difficulty:'easy',environment:'indoor',weather:{available:true,rainChance:90,wind:10,code:61}},{...sample,title:'Hard',difficulty:'hard'}];
  const ranked=rankAdventures(items,{budget:20,availableMinutes:120,mood:'culture',difficulty:'easy',useWeather:true});
  assert.equal(ranked[0].title,'Inside');assert.equal(ranked.length,2);
});
test('distance is zero at same point and missing coordinates do not become zero',()=>{
  assert.equal(distanceKm(33.9,35.5,33.9,35.5),0);
  const r=rankAdventures([{...sample,latitude:null}],{budget:20,availableMinutes:120,mood:'culture',latitude:33.9,longitude:35.5});
  assert.equal(r[0].distanceKm,null);
});

test('weather batches locations and preserves missing weather values', async (t) => {

  // Use a fake API key for automated testing
  const previousKey = process.env.VISUAL_CROSSING_KEY;
  process.env.VISUAL_CROSSING_KEY = 'test-api-key';

  // Restore the original environment after the test
  t.after(() => {
    if (previousKey === undefined) {
      delete process.env.VISUAL_CROSSING_KEY;
    } else {
      process.env.VISUAL_CROSSING_KEY = previousKey;
    }
  });

  let calls = 0;
  const requestedUrls = [];
  const date = todayBeirut();

  // Simulate the Visual Crossing API
  const fake = async (url) => {
    calls++;

    const parsedUrl = new URL(url);
    requestedUrls.push(parsedUrl);

    const firstLocation =
      parsedUrl.pathname.includes('34.1123,35.9876');

    return {
      ok: true,

      json: async () => ({
        days: [
          {
            datetime: date,
            tempmax: firstLocation ? null : 24,
            tempmin: firstLocation ? 12 : 14,
            precipprob: firstLocation ? 80 : 0,
            windspeed: firstLocation ? 15 : 5,
            icon: firstLocation ? 'rain' : 'clear-day',
            conditions: firstLocation ? 'Rain' : 'Clear'
          }
        ]
      })
    };
  };

  const values = await forecasts(
    [
      {
        _id: 'w1',
        latitude: 34.1123,
        longitude: 35.9876
      },
      {
        _id: 'w2',
        latitude: 33.2123,
        longitude: 35.8876
      },
      {
        _id: 'w4',
        latitude: 34.1123,
        longitude: 35.9876
      }
    ],
    date,
    fake
  );

  // Two unique locations require two API calls
  assert.equal(calls, 2);

  // Verify the correct API provider and configuration
  for (const url of requestedUrls) {
    assert.equal(
      url.hostname,
      'weather.visualcrossing.com'
    );

    assert.equal(
      url.searchParams.get('key'),
      'test-api-key'
    );

    assert.equal(
      url.searchParams.get('unitGroup'),
      'metric'
    );
  }

  assert.equal(values.size, 3);

  // Verify missing and zero values are preserved
  assert.equal(values.get('w1').high, null);
  assert.equal(values.get('w2').rainChance, 0);

  // Verify weather code conversion
  assert.equal(values.get('w1').code, 61);
  assert.equal(values.get('w2').code, 0);

  // Verify duplicate locations share the same forecast
  assert.deepEqual(values.get('w1'), values.get('w4'));

  // Verify cached forecasts avoid extra API calls
  const cached = await forecasts(
    [
      {
        _id: 'w5',
        latitude: 34.1123,
        longitude: 35.9876
      }
    ],
    date,
    fake
  );

  assert.equal(calls, 2);
  assert.deepEqual(cached.get('w5'), values.get('w1'));

  // Verify behavior when the API is unavailable
  let offlineCalls = 0;

  const missing = await forecasts(
    [
      {
        _id: 'w3',
        latitude: 32.1111,
        longitude: 36.1111
      }
    ],
    date,
    async () => {
      offlineCalls++;
      throw new Error('offline');
    }
  );

  assert.equal(offlineCalls, 1);
  assert.equal(missing.size, 0);

  // Verify invalid forecast dates are rejected
  assert.equal(validForecastDate('2000-01-01'), false);

});
test('guest cannot import or inspect private draft management endpoints',async()=>{
  assert.equal((await write(request(app).post('/api/adventures/import')).send({records:[sample],dryRun:false})).status,401);
  assert.equal((await request(app).get('/api/adventures/manage')).status,401);
});
test('normal user cannot import records',async t=>{
  process.env.JWT_SECRET='test-only-secret-with-more-than-32-characters';
  const user={_id:'123456789012345678901234',role:'user'};
  t.mock.method(User,'findById',async()=>user);
  const r=await write(request(app).post('/api/adventures/import')).set('Cookie',`la_session=${signToken(user)}`).send({records:[sample],dryRun:false});
  assert.equal(r.status,403);
});
test('pagination uses database skip and count, no 100-record ceiling',async t=>{
  let offset,limit,filter;
  t.mock.method(Adventure,'find',f=>{filter=f;return {sort(){return this;},skip(v){offset=v;return this;},limit(v){limit=v;return this;},lean:async()=>[{...sample,_id:'1'}]};});
  t.mock.method(Adventure,'countDocuments',async()=>125);
  const r=await request(app).get('/api/adventures?page=5&limit=24&q=%5B');
  assert.equal(r.status,200);assert.equal(offset,96);assert.equal(limit,24);assert.equal(r.body.pages,6);assert.deepEqual(filter.status.$in,['published',null]);assert.equal(filter.$or[0].title.test('['),true);
});
test('admin import preview performs no write and import skips duplicates',async t=>{
  process.env.JWT_SECRET='test-only-secret-with-more-than-32-characters';const user={_id:'123456789012345678901234',role:'admin'};
  t.mock.method(User,'findById',async()=>user);t.mock.method(Adventure,'exists',async()=>false);let writes=0;
  t.mock.method(Adventure,'create',async row=>{writes++;assert.equal(row.status,'draft');return row;});
  const send=dryRun=>write(request(app).post('/api/adventures/import')).set('Cookie',`la_session=${signToken(user)}`).send({records:[sample,sample],dryRun});
  const preview=await send(true);assert.equal(preview.status,200);assert.equal(writes,0);assert.equal(preview.body.preview[1].action,'skip duplicate');
  const imported=await send(false);assert.equal(imported.status,200);assert.equal(writes,1);
});

test('catalogue enrichment preserves IDs, edited prices, descriptions and existing photos',async()=>{
  const {missingCatalogueFields}=await import('../src/utils/catalogMerge.js');
  const patch=missingCatalogueFields({...sample,_id:'old-id',imageUrl:'https://example.com/my-photo.jpg',category:'other'},{...sample,description:'Changed',estimatedCost:50,imageUrl:'https://example.com/new.jpg',category:'museum',sourceUrl:'https://example.com/source'});
  assert.deepEqual(patch,{category:'museum',sourceUrl:'https://example.com/source'});
});

test('all bundled catalogue records validate and have a local image with attribution',async()=>{
  const fs=await import('node:fs');const rows=JSON.parse(fs.readFileSync(new URL('../data/lebanon-catalog.json',import.meta.url),'utf8'));
  assert.equal(rows.length,37);assert.equal(new Set(rows.map(x=>x.title)).size,37);
  for(const row of rows){assert.equal(adventureSchema.safeParse(row).success,true,row.title);assert.ok(row.imageCredit&&row.imageLicense&&row.imageSource,row.title);assert.ok(fs.existsSync(new URL('../../client/public'+row.imageUrl,import.meta.url)),row.title);}
});
