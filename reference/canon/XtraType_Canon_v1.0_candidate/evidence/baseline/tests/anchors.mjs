import assert from 'node:assert/strict';
import {parseUrlTarget, targetKey, makeGpsTarget, gpsMatches, makeYoutubeTarget} from '../ext/core/anchors.js';
import {normalizeCustomSchema, validateCustomValue} from '../ext/core/schemas.js';

const url=parseUrlTarget('https://example.com/a?x=1&y=2#z');
assert.equal(targetKey(url),'url:https://example.com/a');
url.value.queryMode='selected';url.value.queryParameters[0].include=true;
assert.equal(targetKey(url),'url:https://example.com/a?x=1');
const gps=makeGpsTarget(41.88,-87.63,null,'test');
assert.equal(gpsMatches(gps,41.8801,-87.6301,75),true);
const yt=makeYoutubeTarget('https://www.youtube.com/watch?v=abc123XYZ_0',12.5,18);
assert.equal(targetKey(yt),'youtube:abc123XYZ_0@12.500-18.000');
const custom=normalizeCustomSchema({$id:'demo.anchor@1',title:'Demo',type:'object',required:['key'],properties:{key:{type:'string'},n:{type:'integer'}}});
assert.equal(validateCustomValue(custom,{key:'a',n:2}),true);
assert.throws(()=>validateCustomValue(custom,{key:''}));
console.log('anchor/schema tests passed');
