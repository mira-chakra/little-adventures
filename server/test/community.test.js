import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { Adventure } from '../src/models/Adventure.js';
import { Favorite } from '../src/models/Favorite.js';
import { User } from '../src/models/User.js';
import { signToken } from '../src/middleware/auth.js';
import { visitSchema } from '../src/utils/validation.js';
import { rankAdventures } from '../src/utils/recommend.js';
const id='123456789012345678901234';
const sample={title:'Community walk',description:'A lovely walk through our village.',region:'Chouf',location:'Daraya',estimatedCost:0,durationMinutes:60,moods:['nature']};
function auth(t,role='user'){process.env.JWT_SECRET='test-only-secret-with-more-than-32-characters';const user={_id:id,role};t.mock.method(User,'findById',async()=>user);return `la_session=${signToken(user)}`;}
const write=r=>r.set('X-Requested-With','LittleAdventures');
test('community and history endpoints require login',async()=>{
 for(const path of ['/submissions','/submissions/review','/history'])assert.equal((await request(app).get('/api'+path)).status,401);
});
test('user submission is pending and cannot inject publication or ownership',async t=>{
 const cookie=auth(t);let created;
 t.mock.method(Adventure,'create',async d=>(created=d));
 const send=body=>write(request(app).post('/api/submissions')).set('Cookie',cookie).send(body);
 assert.equal((await send({...sample,status:'published'})).status,400);
 assert.equal((await send({...sample,submittedBy:'someone'})).status,400);
 assert.equal((await send({...sample,latitude:33.7})).status,400);
 assert.equal((await send(sample)).status,201);assert.equal(created.status,'pending');assert.equal(created.submittedBy,id);
});
test('user can only list their own suggestions',async t=>{
 const cookie=auth(t);let filter;
 t.mock.method(Adventure,'find',f=>{filter=f;return {sort(){return this;},lean:async()=>[]};});
 assert.equal((await request(app).get('/api/submissions').set('Cookie',cookie)).status,200);
 assert.deepEqual(filter,{submittedBy:id});
});
test('normal user cannot review or list other users pending suggestions',async t=>{
 const cookie=auth(t);
 assert.equal((await request(app).get('/api/submissions/review').set('Cookie',cookie)).status,403);
 assert.equal((await write(request(app).patch(`/api/submissions/${id}/review`)).set('Cookie',cookie).send({decision:'approve'})).status,403);
});
test('approval uses atomic pending-only update and rejects repeat decisions',async t=>{
 const cookie=auth(t,'admin');let calls=0;
 t.mock.method(Adventure,'findOneAndUpdate',async(f,u)=>{assert.equal(f.status,'pending');assert.deepEqual(f.submittedBy,{$ne:null});assert.equal(u.$set.status,'published');return calls++===0?{...sample,status:'published'}:null;});
 const send=()=>write(request(app).patch(`/api/submissions/${id}/review`)).set('Cookie',cookie).send({decision:'approve'});
 assert.equal((await send()).status,200);assert.equal((await send()).status,409);
});
test('rejection requires feedback and records it',async t=>{
 const cookie=auth(t,'admin');let updated;
 t.mock.method(Adventure,'findOneAndUpdate',async(f,u)=>(updated=u.$set));
 const send=reason=>write(request(app).patch(`/api/submissions/${id}/review`)).set('Cookie',cookie).send({decision:'reject',reason});
 assert.equal((await send(' ')).status,400);assert.equal((await send('Please provide a more precise location.')).status,200);
 assert.equal(updated.status,'rejected');assert.ok(updated.reviewReason);
});
test('unapproved adventures are excluded from public query and recommendation ranking',async t=>{
 let filter;t.mock.method(Adventure,'find',f=>{filter=f;return {sort(){return this;},skip(){return this;},limit(){return this;},lean:async()=>[]};});t.mock.method(Adventure,'countDocuments',async()=>0);
 await request(app).get('/api/adventures');assert.deepEqual(filter.status,{$in:['published',null]});
 const rows=['draft','pending','rejected','published'].map(status=>({...sample,status}));
 assert.deepEqual(rankAdventures(rows,{budget:10,availableMinutes:120}).map(x=>x.status),['published']);
});
test('visit date rejects impossible or future dates but permits an unknown date',()=>{
 for(const visitedOn of ['2099-01-01','2026-02-31','tomorrow'])assert.equal(visitSchema.safeParse({visitedOn}).success,false);
 assert.equal(visitSchema.safeParse({visitedOn:null}).success,true);
});
test('save visit is scoped to session user and upserts without changing saved favorites',async t=>{
 const cookie=auth(t);let update,filter;
 t.mock.method(Adventure,'exists',async()=>true);
 t.mock.method(Favorite,'findOneAndUpdate',async(f,u)=>{filter=f;update=u;return {_id:id,...u.$set};});
 const r=await write(request(app).put(`/api/history/${id}`)).set('Cookie',cookie).send({visitedOn:'2026-01-01'});
 assert.equal(r.status,200);assert.deepEqual(filter,{user:id,adventure:id});assert.equal(update.$set.visited,true);assert.equal(update.$set.saved,undefined);assert.equal(update.$setOnInsert.saved,false);
});
test('private history is scoped to user and excludes unapproved places',async t=>{
 const cookie=auth(t);let filter,population;
 t.mock.method(Favorite,'find',f=>{filter=f;return {populate(p){population=p;return this;},sort(){return this;},lean:async()=>[]};});
 assert.equal((await request(app).get('/api/history').set('Cookie',cookie)).status,200);assert.deepEqual(filter,{user:id,visited:true});assert.deepEqual(population.match.status,{$in:['published',null]});
});
test('removing a favorite preserves history; removing history preserves favorites',async t=>{
 const cookie=auth(t);const updates=[];
 t.mock.method(Favorite,'updateOne',async(f,u)=>{assert.equal(f.user,id);updates.push(u.$set);return {matchedCount:1};});
 assert.equal((await write(request(app).delete(`/api/favorites/${id}`)).set('Cookie',cookie).send({})).status,200);
 assert.equal((await write(request(app).delete(`/api/history/${id}`)).set('Cookie',cookie).send({})).status,200);
 assert.deepEqual(updates,[{saved:false},{visited:false,visitedOn:null}]);
});
