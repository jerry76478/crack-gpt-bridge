import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {JobBridge,normalizePayload} from '../src/jobs.mjs';
import {sha,writeJSON} from '../src/auth.mjs';

test('terminal body-free retention, restart, migration, limits and usage',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bridge-results-'));
 let now=1800000000000;
 const options={clock:()=>now,fetchImpl:()=>{throw Error('network forbidden');}};
 const value=id=>({request_id:id,model:'fixture',instructions:'PRIVATE_INSTRUCTIONS',input:'PRIVATE_INPUT'});
 try{
  const b=await new JobBridge(dir,options).init();b.closed=true;
  const first=await b.add(value('fixture_completed_0001'));
  assert.equal(first.fingerprint,sha(JSON.stringify(normalizePayload(value(first.request_id)).body)));
  const job=b.jobs.get(first.request_id);
  Object.assign(job,{status:'completed',text:'OUTPUT_BYTES_한글',usage:{total_tokens:4},started_at:now-2,finished_at:now});
  await b.save(job);
  const blocked=await b.add(value('fixture_blocked_00001'));b.jobs.get(blocked.request_id).status='blocked_budget';await b.save(b.jobs.get(blocked.request_id));
  const running=await b.add(value('fixture_running_00001'));b.jobs.get(running.request_id).status='running';await b.save(b.jobs.get(running.request_id));
  const raw=await fs.readFile(path.join(dir,'completed-jobs.json'),'utf8');
  for(const secret of ['PRIVATE_INPUT','PRIVATE_INSTRUCTIONS','"body"','"input"','"instructions"'])assert(!raw.includes(secret));
  assert.deepEqual(await fs.readdir(path.join(dir,'jobs')),[]);
  const again=await new JobBridge(dir,options).init();again.closed=true;
  assert.equal(again.get(first.request_id).text,'OUTPUT_BYTES_한글');
  assert.equal((await again.add(value(first.request_id))).text,'OUTPUT_BYTES_한글');
  await assert.rejects(again.add({...value(first.request_id),input:'different'}),e=>e.code==='REQUEST_CHANGED');
  for(const id of [blocked.request_id,running.request_id])assert.throws(()=>again.get(id),e=>e.code==='NOT_FOUND');
  for(let i=0;i<55;i++){const r=await again.add(value('fixture_many_jobs_'+i));const j=again.jobs.get(r.request_id);Object.assign(j,{status:i%2?'error':'completed',text:'output',started_at:now+i,finished_at:now+i});await again.save(j);}
  now+=100;
  const fifty=await new JobBridge(dir,options).init();assert.equal(fifty.jobs.size,50);assert.equal(fifty.counts().seven_days,56);
  now+=86400001;const expired=await new JobBridge(dir,options).init();assert.equal(expired.jobs.size,0);assert.equal(expired.counts().seven_days,56);
  now+=604800001;const oldUsage=await new JobBridge(dir,options).init();assert.equal(oldUsage.counts().seven_days,0);
  const payload=normalizePayload(value('legacy_complete_0001'));
  await writeJSON(path.join(dir,'jobs',sha(payload.request_id)+'.json'),{...payload,fingerprint:sha(JSON.stringify(payload.body)),status:'completed',text:'legacy_output',started_at:now,finished_at:now,created_at:now});
  const migrated=await new JobBridge(dir,options).init();assert.equal(migrated.get(payload.request_id).text,'legacy_output');
  assert.deepEqual(await fs.readdir(path.join(dir,'jobs')),[]);
  assert(!(await fs.readFile(path.join(dir,'completed-jobs.json'),'utf8')).includes('PRIVATE_INPUT'));
  if(process.platform!=='win32')assert.equal((await fs.stat(path.join(dir,'completed-jobs.json'))).mode&0o777,0o600);
  else assert((await fs.readFile(new URL('../src/auth.mjs',import.meta.url),'utf8')).includes('mode:0o600'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('fake ChatGPT completion uses no port and persists only result',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bridge-fake-result-'));
 try{
  const b=await new JobBridge(dir,{fetchImpl:()=>{throw Error('network forbidden');}}).init();
  b.auth.models=async()=>[{slug:'fixture',efforts:['low']}];b.auth.access=async()=>'fixture-not-real';
  b.auth.fetch=async()=>new Response('data: '+JSON.stringify({type:'response.completed',response:{status:'completed',output:[{type:'message',content:[{type:'output_text',text:'safe output'}]}],usage:{total_tokens:2}}})+'\n\n');
  const r=await b.add({request_id:'actual_fake_job_0001',model:'fixture',input:'REQUEST_PRIVATE'});
  for(let i=0;i<200&&b.running;i++)await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal(b.get(r.request_id).text,'safe output');
  assert(!(await fs.readFile(path.join(dir,'completed-jobs.json'),'utf8')).includes('REQUEST_PRIVATE'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
