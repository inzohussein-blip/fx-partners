"use client";

import { ExternalGate } from "@/components/consent/external-gate";

/**
 * A Myfxbook embed snippet, run in a sandboxed iframe: scripts and links to
 * Myfxbook work, but the frame has no access to this site's origin, cookies or
 * DOM. Consent-gated like every third-party embed.
 *
 * In a sandbox without allow-same-origin, touching document.cookie or
 * localStorage throws, which would stop a third-party script dead. The shim
 * below swaps them for harmless in-memory stand-ins first.
 */
const SHIM = `<script>
try{Object.defineProperty(document,"cookie",{get:function(){return ""},set:function(){},configurable:true})}catch(e){}
try{var m={};var st={getItem:function(k){return k in m?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(){return null},length:0};
Object.defineProperty(window,"localStorage",{value:st,configurable:true});Object.defineProperty(window,"sessionStorage",{value:st,configurable:true})}catch(e){}
</script>`;
export function MyfxbookWidget({ html, height, title }: { html: string; height: number; title: string }) {
  const doc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">
<style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff}</style>${SHIM}</head>
<body>${html}</body></html>`;
  return (
    <ExternalGate minHeight={height}>
      <iframe
        title={title}
        srcDoc={doc}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full rounded-xl border border-fg/10 bg-white"
        style={{ height }}
      />
    </ExternalGate>
  );
}
