import './polyfills.server.mjs';
import{a as o}from"./chunk-HEAZBUU3.mjs";import{M as r,R as e,fc as i}from"./chunk-H76B5D7D.mjs";var n=class t{constructor(c){this.http=c}url=o.apiUrl+"Service";getService(){return this.http.get(this.url,{transferCache:!1})}static \u0275fac=function(a){return new(a||t)(e(i))};static \u0275prov=r({token:t,factory:t.\u0275fac,providedIn:"root"})};export{n as a};
