import test from 'node:test';import assert from 'node:assert/strict';import 'fake-indexeddb/auto';
import * as db from '../ext/core/db.js';import {parseUrlTarget,targetKey}from'../ext/core/anchors.js';
let listener,active=true,network=0,captures=[],session={};const ctx={pageUrl:'https://example.com/a',title:'page',highlightedText:'',currentVideoTime:null,viewport:{width:100,height:100,devicePixelRatio:1},page:{width:100,height:100}};
globalThis.fetch=async()=>{network++;throw new Error('offline');};
globalThis.chrome={
 runtime:{id:'test-extension',onInstalled:{addListener(){}},onStartup:{addListener(){}},onMessage:{addListener(fn){listener=fn;}}},
 contextMenus:{removeAll:async()=>{},create(){},onClicked:{addListener(){}}},sidePanel:{setPanelBehavior:async()=>{},open:async()=>{}},
 storage:{local:{get:async()=>({xtratypeSettings:{autoSync:false}})},session:{get:async()=>session,set:async v=>Object.assign(session,v)}},
 tabs:{query:async()=>[{id:1,url:ctx.pageUrl,windowId:2,active}],get:async()=>({id:1,url:ctx.pageUrl,windowId:2,active}),sendMessage:async()=>{},captureVisibleTab:async()=>{captures.push(Date.now());return'data:image/png;base64,eA==';}},
 scripting:{executeScript:async()=>[{documentId:'doc',result:ctx}]},
};
await import('../ext/service-worker.js');
const call=(m,sender={id:'test-extension'})=>new Promise(resolve=>listener(m,sender,resolve));
test('worker denies untrusted caller and page-origin capture privilege',async()=>{assert.equal((await call({type:'xtratype:getContext'},{id:'other'})).ok,false);assert.equal((await call({type:'xtratype:captureVisible'},{id:'test-extension',tab:{id:1},url:ctx.pageUrl})).ok,false);});
test('worker reply validates body and honors disabled autosync',async()=>{
 const t=parseUrlTarget(ctx.pageUrl);await db.put('annotations',{id:'parent',target:t,targetKey:targetKey(t),body:'parent',syncState:'local'});
 assert.equal((await call({type:'xtratype:quickReply',annotationId:'parent',body:' '})).ok,false);
 const r=await call({type:'xtratype:quickReply',annotationId:'parent',body:'reply'});assert.equal(r.ok,true);assert.equal(r.item.parentAnnotationId,'parent');assert.equal(r.item.syncState,'local');assert.equal(network,0);
});
test('worker rejects stale quick-save document and cross-video reads',async()=>{
 const sender={id:'test-extension',tab:{id:1,url:ctx.pageUrl},url:ctx.pageUrl,documentId:'old-doc'};
 assert.equal((await call({type:'xtratype:quickCreate',payload:{body:'draft',pageUrl:ctx.pageUrl}},sender)).ok,false);
 assert.equal((await call({type:'xtratype:getYouTubeAnnotations',videoId:'other'},sender)).ok,false);
});
test('worker capture pins active tab/document and serializes rate limit',async()=>{
 const m={type:'xtratype:captureVisible',tabId:1,windowId:2,documentId:'doc',pageUrl:ctx.pageUrl,viewport:ctx.viewport,page:ctx.page};
 active=false;assert.equal((await call(m)).ok,false);active=true;assert.equal((await call({...m,documentId:'wrong'})).ok,false);
 const results=await Promise.all([call(m),call(m)]);assert.ok(results.every(r=>r.ok));assert.equal(captures.length,2);assert.ok(captures[1]-captures[0]>=590);
});
