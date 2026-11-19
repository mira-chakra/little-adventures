import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { rankAdventures } from '../src/utils/recommend.js';

const write = req => req.set('X-Requested-With','LittleAdventures').set('Content-Type','application/json');
test('GET /api/health responds successfully without a database', async () => {
  const r=await request(app).get('/api/health');
  assert.equal(r.status,200);assert.equal(r.body.status,'ok');
});
test('protected favorites reject guests with 401',async()=>{
  const r=await request(app).get('/api/favorites');assert.equal(r.status,401);
});
test('admin CRUD rejects requests with no session',async()=>{
  const r=await write(request(app).post('/api/adventures')).send({title:'Unauthorized'});assert.equal(r.status,401);
});
test('security: CSRF-like POST without app header is rejected',async()=>{
  const r=await request(app).post('/api/auth/login').send({email:'any@example.com',password:'NoPassword1'});assert.equal(r.status,403);
});
test('security: unexpected role field is not accepted for signup',async()=>{
  const r=await write(request(app).post('/api/auth/register')).send({name:'Test User',email:'test@example.com',password:'SecurePass1',role:'admin'});
  assert.equal(r.status,400);assert.equal(r.body.error,'Invalid input');
});
test('invalid login input is rejected without database access',async()=>{
  const r=await write(request(app).post('/api/auth/login')).send({email:'not-an-email',password:''});assert.equal(r.status,400);
});
test('recommendation applies all conditions and orders results by score',()=>{
  const items=[
    {_id:'1',title:'Cheap beach',estimatedCost:5,durationMinutes:60,moods:['relax'],region:'South Lebanon'},
    {_id:'2',title:'Expensive beach',estimatedCost:50,durationMinutes:60,moods:['relax'],region:'South Lebanon'},
    {_id:'3',title:'Hiking',estimatedCost:0,durationMinutes:90,moods:['nature'],region:'South Lebanon'},
    {_id:'4',title:'Long beach',estimatedCost:5,durationMinutes:300,moods:['relax'],region:'South Lebanon'}
  ];
  const ranked=rankAdventures(items,{budget:20,availableMinutes:120,mood:'relax',region:'South Lebanon'});
  assert.deepEqual(ranked.map(x=>x.title),['Cheap beach']);
  assert.equal(ranked[0].matchScore>60,true);
});
test('recommendation returns empty when there is no match',()=>{
  assert.deepEqual(rankAdventures([{title:'x',estimatedCost:30,durationMinutes:60,moods:['culture'],region:'Beirut'}],{budget:0,availableMinutes:30,mood:'nature'}),[]);
});
