import{r as p,f as d}from"./charts-BuvzcB0r.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function i(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(e){if(e.ep)return;e.ep=!0;const r=i(e);fetch(e.href,r)}})();var l={exports:{}},c={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var m=p,y=Symbol.for("react.element"),_=Symbol.for("react.fragment"),O=Object.prototype.hasOwnProperty,v=m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,h={key:!0,ref:!0,__self:!0,__source:!0};function a(n,t,i){var o,e={},r=null,s=null;i!==void 0&&(r=""+i),t.key!==void 0&&(r=""+t.key),t.ref!==void 0&&(s=t.ref);for(o in t)O.call(t,o)&&!h.hasOwnProperty(o)&&(e[o]=t[o]);if(n&&n.defaultProps)for(o in t=n.defaultProps,t)e[o]===void 0&&(e[o]=t[o]);return{$$typeof:y,type:n,key:r,ref:s,props:e,_owner:v.current}}c.Fragment=_;c.jsx=a;c.jsxs=a;l.exports=c;var R=l.exports,f={},u=d;f.createRoot=u.createRoot,f.hydrateRoot=u.hydrateRoot;export{f as c,R as j};
