const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const els = {
  brawler: document.getElementById("brawler"),
  mode: document.getElementById("mode"),
  start: document.getElementById("start"),
  end: document.getElementById("end"),
  template: document.getElementById("template"),
  duration: document.getElementById("duration"),
  deltaValue: document.getElementById("deltaValue"),
  deltaText: document.getElementById("deltaText"),
  deltaBar: document.getElementById("deltaBar"),
  previewBtn: document.getElementById("previewBtn"),
  exportBtn: document.getElementById("exportBtn"),
  renderState: document.getElementById("renderState"),
  renderNote: document.getElementById("renderNote"),
  timeLabel: document.getElementById("timeLabel"),
  timelineProgress: document.getElementById("timelineProgress")
};

const brawlers = [
  {name:"Nova", short:"N", a:"#8b5cf6", b:"#22d3ee"},
  {name:"Bolt", short:"B", a:"#f59e0b", b:"#fb7185"},
  {name:"Rex", short:"R", a:"#22c55e", b:"#14b8a6"},
  {name:"Vega", short:"V", a:"#ec4899", b:"#8b5cf6"},
  {name:"Mako", short:"M", a:"#3b82f6", b:"#06b6d4"},
  {name:"Ember", short:"E", a:"#ef4444", b:"#f59e0b"}
];

for (const [i,b] of brawlers.entries()) {
  const option = document.createElement("option");
  option.value = b.name;
  option.textContent = b.name;
  option.selected = i === 0;
  els.brawler.appendChild(option);
}

let rafId = null;

const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const easeOut = t => 1 - Math.pow(1-clamp(t,0,1),4);
const easeInOut = t => t < .5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;

function config(){
  return {
    brawler: els.brawler.value,
    mode: els.mode.value,
    start: Number(els.start.value || 0),
    end: Number(els.end.value || 0),
    template: els.template.value,
    duration: Number(els.duration.value || 6.5)
  };
}

function rr(c,x,y,w,h,r){
  const q=Math.min(r,w/2,h/2);
  c.beginPath();
  c.moveTo(x+q,y);
  c.arcTo(x+w,y,x+w,y+h,q);
  c.arcTo(x+w,y+h,x,y+h,q);
  c.arcTo(x,y+h,x,y,q);
  c.arcTo(x,y,x+w,y,q);
  c.closePath();
}

function fillGradient(c,x,y,w,h,a,b){
  const g=c.createLinearGradient(x,y,x+w,y+h);
  g.addColorStop(0,a); g.addColorStop(1,b);
  return g;
}

function background(c,w,h,p){
  const g=c.createLinearGradient(0,0,w,h);
  g.addColorStop(0,"#09121a"); g.addColorStop(.5,"#111828"); g.addColorStop(1,"#05090d");
  c.fillStyle=g; c.fillRect(0,0,w,h);

  const glow=c.createRadialGradient(w*.5,h*.37,0,w*.5,h*.37,h*.65);
  glow.addColorStop(0,"rgba(74,95,255,.22)");
  glow.addColorStop(.55,"rgba(48,203,255,.05)");
  glow.addColorStop(1,"rgba(0,0,0,0)");
  c.fillStyle=glow; c.fillRect(0,0,w,h);

  c.save();
  c.globalAlpha=.09;
  c.strokeStyle="#d9efff"; c.lineWidth=2;
  const off=(p*180)%140;
  for(let x=-180;x<w+180;x+=140){
    c.beginPath(); c.moveTo(x+off,0); c.lineTo(x-320+off,h); c.stroke();
  }
  c.restore();

  for(let i=0;i<22;i++){
    const x=(i*91+p*w*.07)%w, y=(i*149+p*h*.05)%h;
    c.fillStyle="rgba(255,255,255,.045)";
    c.beginPath(); c.arc(x,y,2+(i%4),0,Math.PI*2); c.fill();
  }
}

function header(c,cfg){
  c.fillStyle="rgba(255,255,255,.07)";
  rr(c,50,48,980,64,20); c.fill();
  c.fillStyle="#a9b9c8"; c.font="800 22px Inter,system-ui"; c.textAlign="left";
  c.fillText(cfg.mode.toUpperCase(),78,88);
  c.fillStyle="#647788"; c.font="700 18px Inter,system-ui"; c.textAlign="right";
  c.fillText("BOOST STUDIO",1000,88);
  c.textAlign="left";
}

function brawler(c,b,x,y,s,alpha,tilt){
  c.save();
  c.globalAlpha=alpha; c.translate(x,y); c.rotate(tilt); c.scale(s,s);

  c.shadowColor=b.a; c.shadowBlur=55;
  c.fillStyle=fillGradient(c,-125,-160,250,340,b.a,b.b);
  rr(c,-115,-160,230,310,68); c.fill();
  c.shadowBlur=0;

  c.fillStyle="#111826"; rr(c,-96,-136,192,168,55); c.fill();
  c.fillStyle="#f4f7fb";
  c.beginPath(); c.arc(-40,-50,19,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(40,-50,19,0,Math.PI*2); c.fill();
  c.fillStyle="#11151e";
  c.beginPath(); c.arc(-40,-50,8,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(40,-50,8,0,Math.PI*2); c.fill();
  c.fillStyle="#0a0f16"; rr(c,-58,4,116,30,12); c.fill();

  c.fillStyle="#fff"; c.font="900 68px Inter,system-ui"; c.textAlign="center"; c.fillText(b.short,0,110);
  c.restore();
}

function trophy(c,x,y,s,alpha){
  c.save(); c.globalAlpha=alpha; c.translate(x,y);
  c.shadowColor="rgba(255,196,70,.7)"; c.shadowBlur=34;
  c.fillStyle=fillGradient(c,-s,-s,s*2,s*2,"#fff1a2","#f6ae2d");
  c.beginPath();
  c.moveTo(-s*.55,-s*.55); c.lineTo(s*.55,-s*.55); c.lineTo(s*.42,s*.2);
  c.quadraticCurveTo(0,s*.56,-s*.42,s*.2); c.closePath(); c.fill();
  c.shadowBlur=0; c.fillRect(-s*.12,s*.15,s*.24,s*.45); c.fillRect(-s*.5,s*.5,s,s*.2);
  c.strokeStyle="#ffd965"; c.lineWidth=s*.11;
  c.beginPath(); c.arc(-s*.52,-s*.14,s*.42,Math.PI/2,Math.PI*1.5); c.stroke();
  c.beginPath(); c.arc(s*.52,-s*.14,s*.42,-Math.PI/2,Math.PI/2); c.stroke();
  c.restore();
}

function badge(c,x,y,alpha,label){
  c.save(); c.globalAlpha=alpha; c.font="800 20px Inter,system-ui";
  const w=Math.max(210,c.measureText(label).width+52);
  c.fillStyle="rgba(255,255,255,.08)"; rr(c,x-w/2,y-28,w,56,18); c.fill();
  c.strokeStyle="rgba(255,255,255,.1)"; c.stroke();
  c.fillStyle="#c9d6e0"; c.textAlign="center"; c.fillText(label,x,y+7); c.restore();
}

function rays(c,x,y,amount,phase){
  c.save(); c.translate(x,y);
  for(let i=0;i<amount;i++){
    const a=Math.PI*2/amount*i+phase*2;
    const d=150+(i*47%240)*phase;
    const l=30+(i*19%55);
    c.strokeStyle="rgba(255,255,255,"+(0.08+phase*.18)+")";
    c.lineWidth=8-(i%4);
    c.beginPath(); c.moveTo(Math.cos(a)*d,Math.sin(a)*d); c.lineTo(Math.cos(a)*(d+l),Math.sin(a)*(d+l)); c.stroke();
  }
  c.restore();
}

function frame(seconds){
  const cfg=config(), w=canvas.width, h=canvas.height, p=clamp(seconds/cfg.duration,0,1);
  const b=brawlers.find(x=>x.name===cfg.brawler)||brawlers[0];
  background(ctx,w,h,p); header(ctx,cfg);

  const intro=easeOut(p/.24);
  const hero=easeOut((p-.12)/.32);
  const result=easeOut((p-.32)/.20);
  const count=easeInOut((p-.45)/.38);
  const final=easeOut((p-.82)/.18);

  brawler(ctx,b,540,690-(1-intro)*240,.95*intro,Math.min(1,intro*1.3),(1-intro)*-.08);

  ctx.textAlign="center";
  ctx.fillStyle="rgba(255,255,255,"+hero+")";
  ctx.font="900 84px Inter,system-ui"; ctx.fillText("VICTORY",540,1020);

  if(cfg.template==="promotion") badge(ctx,540,280,hero,"RANK PUSH");
  else if(cfg.template==="streak") badge(ctx,540,280,hero,"WIN STREAK");
  else trophy(ctx,540,1240,76,result);

  rays(ctx,540,1015,18,result*.8);

  const current=Math.round(cfg.start+(cfg.end-cfg.start)*count);
  const delta=cfg.end-cfg.start;

  ctx.fillStyle="rgba(205,220,232,.7)"; ctx.font="700 22px Inter,system-ui";
  ctx.fillText(cfg.mode.toUpperCase(),540,1390);
  ctx.fillStyle="#fff"; ctx.font="900 118px Inter,system-ui";
  ctx.fillText(current.toLocaleString("pt-PT"),540,1505);
  ctx.fillStyle=delta>=0?"#61f3a7":"#ff819e"; ctx.font="900 46px Inter,system-ui";
  ctx.fillText((delta>=0?"+":"")+delta,540,1575);

  badge(ctx,540,1770,final,cfg.start.toLocaleString("pt-PT")+"  →  "+cfg.end.toLocaleString("pt-PT"));
  if(final>0){
    ctx.fillStyle="rgba(255,255,255,"+(final*.5)+")"; ctx.font="600 18px Inter,system-ui";
    ctx.fillText("ORIGINAL ANIMATION · BOOST STUDIO",540,1830);
  }
  return p;
}

function sync(){
  const cfg=config(), delta=cfg.end-cfg.start;
  els.deltaValue.textContent=(delta>=0?"+":"")+delta;
  els.deltaText.textContent=cfg.start.toLocaleString("pt-PT")+" → "+cfg.end.toLocaleString("pt-PT");
  const ratio=clamp(Math.abs(delta)/Math.max(100,Math.abs(cfg.end)),.08,1);
  els.deltaBar.style.width=(ratio*100)+"%";
  els.timeLabel.textContent="0.0 / "+cfg.duration.toFixed(1)+"s";
  frame(0);
}

async function plan(){
  const r=await fetch("/api/render-plan",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(config())
  });
  if(!r.ok) throw new Error("O servidor rejeitou o plano de render.");
  return r.json();
}

function preview(){
  if(rafId) cancelAnimationFrame(rafId);
  const cfg=config(), started=performance.now();
  els.renderState.textContent="Rendering";
  els.renderNote.textContent="A reproduzir a timeline completa…";

  const loop=now=>{
    const elapsed=(now-started)/1000, p=frame(Math.min(elapsed,cfg.duration));
    els.timeLabel.textContent=Math.min(elapsed,cfg.duration).toFixed(1)+" / "+cfg.duration.toFixed(1)+"s";
    els.timelineProgress.style.width=(p*100)+"%";
    if(elapsed<cfg.duration) rafId=requestAnimationFrame(loop);
    else{
      els.renderState.textContent="Ready";
      els.renderNote.textContent="Preview concluído. O exportador usa a mesma timeline.";
    }
  };
  rafId=requestAnimationFrame(loop);
}

async function exportVideo(){
  if(!window.MediaRecorder){
    els.renderState.textContent="Unsupported";
    els.renderNote.textContent="Este browser não suporta MediaRecorder.";
    return;
  }

  try{
    const serverData=await plan(), cfg=config();
    const types=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
    const mime=types.find(x=>MediaRecorder.isTypeSupported(x));
    if(!mime) throw new Error("Nenhum formato WebM suportado.");

    if(rafId) cancelAnimationFrame(rafId);

    const stream=canvas.captureStream(60);
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:12000000});
    const chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};

    const stopped=new Promise(resolve=>{recorder.onstop=resolve;});
    recorder.start(200);
    els.renderState.textContent="Exporting";
    els.renderNote.textContent="A gerar "+serverData.plan.resolution+" · "+serverData.plan.format+"…";

    const started=performance.now();
    await new Promise(resolve=>{
      const loop=now=>{
        const elapsed=(now-started)/1000, p=frame(Math.min(elapsed,cfg.duration));
        els.timeLabel.textContent=Math.min(elapsed,cfg.duration).toFixed(1)+" / "+cfg.duration.toFixed(1)+"s";
        els.timelineProgress.style.width=(p*100)+"%";
        if(elapsed<cfg.duration) requestAnimationFrame(loop);
        else setTimeout(resolve,150);
      };
      requestAnimationFrame(loop);
    });

    recorder.stop(); await stopped;

    const blob=new Blob(chunks,{type:"video/webm"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    const slug=cfg.brawler.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    a.download="boost-studio-"+slug+"-"+Date.now()+".webm";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);

    els.renderState.textContent="Exported";
    els.renderNote.textContent="Vídeo criado com sucesso. O ficheiro foi exportado pelo browser.";
  }catch(err){
    console.error(err);
    els.renderState.textContent="Error";
    els.renderNote.textContent=err.message||"Falha ao exportar.";
  }
}

[els.brawler,els.mode,els.start,els.end,els.template,els.duration].forEach(el=>{
  el.addEventListener("input",sync); el.addEventListener("change",sync);
});
els.previewBtn.addEventListener("click",preview);
els.exportBtn.addEventListener("click",exportVideo);
sync();
