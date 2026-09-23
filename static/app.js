const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");

const el = {
  baseImage: document.getElementById("baseImage"),
  clearBase: document.getElementById("clearBase"),
  brawler: document.getElementById("brawler"),
  mode: document.getElementById("mode"),
  start: document.getElementById("start"),
  end: document.getElementById("end"),
  template: document.getElementById("template"),
  brawlerImage: document.getElementById("brawlerImage"),
  victoryImage: document.getElementById("victoryImage"),
  pointsImage: document.getElementById("pointsImage"),
  avatarImage: document.getElementById("avatarImage"),
  renderBtn: document.getElementById("renderBtn"),
  pngBtn: document.getElementById("pngBtn"),
  webmBtn: document.getElementById("webmBtn"),
  renderState: document.getElementById("renderState"),
  renderNote: document.getElementById("renderNote"),
  deltaLabel: document.getElementById("deltaLabel"),
  dataLabel: document.getElementById("dataLabel"),
};

const brawlers = ["Nova","Bolt","Rex","Vega","Mako","Ember"];
for (const name of brawlers) {
  const o = document.createElement("option");
  o.value = name; o.textContent = name;
  el.brawler.appendChild(o);
}

const assets = {
  base: null,
  brawler: null,
  victory: null,
  points: null,
  avatar: null,
};

function cfg() {
  const start = Number(el.start.value || 0);
  const end = Number(el.end.value || 0);
  return { brawler: el.brawler.value, mode: el.mode.value, start, end, template: el.template.value };
}

function loadFile(input, key) {
  const file = input.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    assets[key] = img;
    URL.revokeObjectURL(url);
    render();
  };
  img.src = url;
}

[["baseImage","base"],["brawlerImage","brawler"],["victoryImage","victory"],["pointsImage","points"],["avatarImage","avatar"]].forEach(([id,key]) => {
  el[id].addEventListener("change", () => loadFile(el[id], key));
});

el.clearBase.addEventListener("click", () => {
  assets.base = null;
  el.baseImage.value = "";
  render();
});

function contain(img, x, y, w, h) {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  ctx.drawImage(img, x + (w-dw)/2, y + (h-dh)/2, dw, dh);
}

function cover(img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  ctx.drawImage(img, x + (w-dw)/2, y + (h-dh)/2, dw, dh);
}

function roundRect(x,y,w,h,r,fill,stroke) {
  ctx.beginPath();
  const q=Math.min(r,w/2,h/2);
  ctx.moveTo(x+q,y);
  ctx.arcTo(x+w,y,x+w,y+h,q);
  ctx.arcTo(x+w,y+h,x,y+h,q);
  ctx.arcTo(x,y+h,x,y,q);
  ctx.arcTo(x,y,x+w,y,q);
  ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}

function makeTemplateBase(c) {
  const w=canvas.width,h=canvas.height;
  const bg=ctx.createLinearGradient(0,0,w,h);
  bg.addColorStop(0,"#172033"); bg.addColorStop(.52,"#101724"); bg.addColorStop(1,"#070b10");
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);

  ctx.globalAlpha=.2;
  ctx.fillStyle="#394b68";
  for(let i=0;i<8;i++){
    ctx.beginPath();
    ctx.moveTo(i*160,340);
    ctx.lineTo(i*160+260,340);
    ctx.lineTo(i*160+380,1920);
    ctx.lineTo(i*160+100,1920);
    ctx.closePath(); ctx.fill();
  }
  ctx.globalAlpha=1;

  ctx.fillStyle="rgba(8,12,18,.85)";
  roundRect(40,40,1000,110,26, "rgba(8,12,18,.88)");
  ctx.fillStyle="#cbd6e1"; ctx.font="800 30px Inter,system-ui"; ctx.textAlign="left";
  ctx.fillText(c.mode.toUpperCase(),76,108);
  ctx.textAlign="right"; ctx.fillStyle="#7e91a5"; ctx.font="700 20px Inter,system-ui";
  ctx.fillText("MATCH END",1000,108);
  ctx.textAlign="center";

  // Main result plate: deliberately static, like a final match screen.
  ctx.fillStyle="rgba(4,8,12,.75)";
  roundRect(95,500,890,735,44,"rgba(4,8,12,.76)");
  ctx.strokeStyle="rgba(255,255,255,.12)"; ctx.lineWidth=2; ctx.stroke();

  ctx.fillStyle="#f8fafc"; ctx.font="950 92px Inter,system-ui";
  ctx.fillText("VICTORY",540,640);

  ctx.fillStyle="#91a4b5"; ctx.font="700 24px Inter,system-ui";
  ctx.fillText("FINAL RESULT",540,690);

  const delta=c.end-c.start;
  ctx.fillStyle=delta>=0?"#71f2ac":"#ff829e";
  ctx.font="950 62px Inter,system-ui";
  ctx.fillText((delta>=0?"+":"")+delta,540,1120);

  ctx.fillStyle="#7f93a7"; ctx.font="700 23px Inter,system-ui";
  ctx.fillText(c.start.toLocaleString("pt-PT")+"  →  "+c.end.toLocaleString("pt-PT"),540,1170);

  ctx.fillStyle="#9fb0bf"; ctx.font="700 21px Inter,system-ui";
  ctx.fillText("ORIGINAL COMPOSITION · BOOST STUDIO",540,1810);
}

function iconOrFallback(img, x,y,s, kind) {
  if(img){ contain(img,x,y,s,s); return; }
  if(kind==="brawler"){
    const g=ctx.createLinearGradient(x,y,x+s,y+s); g.addColorStop(0,"#8b5cf6"); g.addColorStop(1,"#22d3ee");
    roundRect(x,y,s,s,26,g);
    ctx.fillStyle="#0f1622"; roundRect(x+20,y+26,s-40,s*.62,24,"#0f1622");
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(x+s*.35,y+s*.42,11,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+s*.65,y+s*.42,11,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#0a0f16"; ctx.font="950 "+Math.floor(s*.38)+"px Inter,system-ui"; ctx.textAlign="center";
    ctx.fillText(el.brawler.value[0],x+s/2,y+s*.86);
  } else if(kind==="victory"){
    roundRect(x,y,s,s,26,"#152030","#57e4aa");
    ctx.fillStyle="#57e4aa"; ctx.font="950 "+Math.floor(s*.35)+"px Inter,system-ui"; ctx.textAlign="center"; ctx.fillText("✓",x+s/2,y+s*.62);
  } else {
    roundRect(x,y,s,s,26,"#1b2735","#d3a844");
    ctx.fillStyle="#d3a844"; ctx.font="950 "+Math.floor(s*.28)+"px Inter,system-ui"; ctx.textAlign="center"; ctx.fillText("★",x+s/2,y+s*.60);
  }
}

function render() {
  const c=cfg(), w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  if(assets.base) cover(assets.base,0,0,w,h);
  else makeTemplateBase(c);

  // dark veil makes overlay content readable without changing the supplied base image too aggressively
  if(assets.base){
    ctx.fillStyle="rgba(4,7,11,.18)"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(4,7,11,.63)"; roundRect(95,500,890,735,44,"rgba(4,8,12,.63)");
  }

  // Top strip
  ctx.fillStyle="rgba(8,12,18,.82)"; roundRect(40,40,1000,110,26,"rgba(8,12,18,.82)");
  ctx.fillStyle="#cbd6e1"; ctx.font="800 30px Inter,system-ui"; ctx.textAlign="left";
  ctx.fillText(c.mode.toUpperCase(),76,108);
  ctx.textAlign="right"; ctx.fillStyle="#7e91a5"; ctx.font="700 20px Inter,system-ui";
  ctx.fillText("MATCH END",1000,108);

  // Main variable elements
  iconOrFallback(assets.brawler,145,585,210,"brawler");
  iconOrFallback(assets.victory,725,585,210,"victory");
  iconOrFallback(assets.points,455,1015,170,"points");
  iconOrFallback(assets.avatar,455,1375,170,"avatar");

  ctx.textAlign="center";
  ctx.fillStyle="#f8fafc"; ctx.font="950 92px Inter,system-ui"; ctx.fillText("VICTORY",540,880);
  ctx.fillStyle="#91a4b5"; ctx.font="700 24px Inter,system-ui"; ctx.fillText(c.brawler.toUpperCase(),540,930);

  const delta=c.end-c.start;
  ctx.fillStyle=delta>=0?"#71f2ac":"#ff829e"; ctx.font="950 62px Inter,system-ui";
  ctx.fillText((delta>=0?"+":"")+delta,540,1285);

  ctx.fillStyle="#9fb0bf"; ctx.font="800 24px Inter,system-ui";
  ctx.fillText(c.start.toLocaleString("pt-PT")+"  →  "+c.end.toLocaleString("pt-PT"),540,1335);

  ctx.fillStyle="#7f93a7"; ctx.font="700 21px Inter,system-ui";
  ctx.fillText("COMPOSED FROM YOUR OWN BASE FRAME + ICONS",540,1810);

  el.deltaLabel.textContent=(delta>=0?"+":"")+delta;
  el.dataLabel.textContent=c.start.toLocaleString("pt-PT")+" → "+c.end.toLocaleString("pt-PT");
}

async function serverPlan() {
  const response=await fetch("/api/render-plan",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(cfg())
  });
  if(!response.ok) throw new Error("Não foi possível validar a composição no servidor.");
  return response.json();
}

el.renderBtn.addEventListener("click", async () => {
  try {
    await serverPlan();
    render();
    el.renderState.textContent="Ready";
    el.renderNote.textContent="Composição atualizada. É um frame estático, não uma animação.";
  } catch (e) {
    el.renderState.textContent="Error";
    el.renderNote.textContent=e.message;
  }
});

el.pngBtn.addEventListener("click", async () => {
  try {
    await serverPlan();
    render();
    const a=document.createElement("a");
    a.href=canvas.toDataURL("image/png");
    a.download="boost-studio-match-end.png";
    a.click();
    el.renderState.textContent="PNG";
    el.renderNote.textContent="Imagem PNG exportada.";
  } catch(e) {
    el.renderState.textContent="Error";
    el.renderNote.textContent=e.message;
  }
});

el.webmBtn.addEventListener("click", async () => {
  try {
    const data=await serverPlan();
    if(!window.MediaRecorder) throw new Error("Este browser não suporta MediaRecorder.");
    render();

    const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
    if(!mime) throw new Error("Este browser não suporta um formato WebM.");

    // Static video: the same final-match frame is recorded for a few seconds.
    const stream=canvas.captureStream(30);
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:10000000});
    const chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};

    recorder.start(250);
    el.renderState.textContent="Exporting";
    el.renderNote.textContent="A gravar o ecrã final estático…";

    await new Promise(resolve=>setTimeout(resolve,4000));
    recorder.stop();

    await new Promise(resolve=>recorder.onstop=resolve);
    const blob=new Blob(chunks,{type:"video/webm"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="boost-studio-match-end.webm";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);

    el.renderState.textContent="WebM";
    el.renderNote.textContent="Vídeo estático exportado. A composição não inclui animações artificiais.";
  } catch(e) {
    el.renderState.textContent="Error";
    el.renderNote.textContent=e.message;
  }
});

[el.brawler,el.mode,el.start,el.end,el.template].forEach(input=>{
  input.addEventListener("input",render);
  input.addEventListener("change",render);
});

render();
