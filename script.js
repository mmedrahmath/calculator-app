// script.js - calculator logic (replica)
const displayEl = document.getElementById('display');
const exprEl = document.getElementById('expr');
const invBtn = document.getElementById('invBtn');

let state = {
  expr: '',
  entry: '0',
  inv: false,
  angle: 'DEG', // DEG or RAD
  memory: 0,
  fix: null // decimal places when FIX used
};

function updateScreen(){
  exprEl.textContent = state.expr || '\u00A0';
  displayEl.textContent = state.entry;
}

function inputDigit(d){
  if(state.entry === '0' && d !== '.') state.entry = d;
  else if(state.entry === 'Error') state.entry = d;
  else state.entry += d;
  updateScreen();
}

function pushOp(op){
  state.expr = (state.expr? state.expr + ' ' : '') + state.entry + ' ' + op;
  state.entry = '0';
  updateScreen();
}

function backspace(){
  if(state.entry === 'Error') state.entry = '0';
  else {
    state.entry = state.entry.slice(0,-1) || '0';
  }
  updateScreen();
}

function clearEntry(){ state.entry = '0'; updateScreen(); }
function allClear(){ state.entry='0'; state.expr=''; state.fix=null; updateScreen(); }

function toggleInv(){
  state.inv = !state.inv;
  invBtn.style.opacity = state.inv ? '1' : '0.9';
}

function toggleDRG(){
  state.angle = state.angle === 'DEG' ? 'RAD' : 'DEG';
  document.querySelectorAll('[data-fn="deg"]')[0].textContent = state.angle;
}

function applyUnary(name){
  try{
    let x = parseFloat(state.entry);
    let r = NaN;
    const toRad = v => state.angle==='DEG' ? v*Math.PI/180 : v;
    const fromRad = v => state.angle==='DEG' ? v*180/Math.PI : v;

    if(name==='sin') r = Math.sin(toRad(x));
    if(name==='cos') r = Math.cos(toRad(x));
    if(name==='tan') r = Math.tan(toRad(x));
    if(name==='asin') r = fromRad(Math.asin(x));
    if(name==='acos') r = fromRad(Math.acos(x));
    if(name==='atan') r = fromRad(Math.atan(x));
    if(name==='ln') r = Math.log(x);
    if(name==='log') r = Math.log10(x);
    if(name==='sqrt') r = Math.sqrt(x);
    if(name==='sqr') r = x*x;
    if(name==='1/x') r = 1/x;
    if(name==='fact') {
      let n = Math.floor(x);
      if(n<0) r = NaN;
      else { r = 1; for(let i=2;i<=n;i++) r*=i; }
    }
    if(name==='neg') r = -x;
    if(isFinite(r)) {
      if(state.fix!==null) r = roundTo(r, state.fix);
      state.entry = String(r);
    } else state.entry = 'Error';
    updateScreen();
  }catch(e){ state.entry='Error'; updateScreen(); }
}

function applyBinary(op){
  // if previous expr ends with ^ treat specially, otherwise push op
  state.expr = (state.expr? state.expr + ' ' : '') + state.entry + ' ' + op;
  state.entry = '0';
  updateScreen();
}

function roundTo(v,dec){ const p = Math.pow(10,dec); return Math.round(v*p)/p; }

function evaluateAll(){
  try{
    // build JS expression from state.expr + entry
    let full = (state.expr ? state.expr + ' ' : '') + state.entry;
    // replace symbols
    full = full.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');
    // support ^ as power
    full = full.replace(/\^/g,'**');

    // map function names to safe implementations
    const DEG = state.angle === 'DEG';
    const toRad = x => DEG ? x*Math.PI/180 : x;
    const fromRad = x => DEG ? x*180/Math.PI : x;
    const scope = {
      sin: x => Math.sin(toRad(x)),
      cos: x => Math.cos(toRad(x)),
      tan: x => Math.tan(toRad(x)),
      asin: x => fromRad(Math.asin(x)),
      acos: x => fromRad(Math.acos(x)),
      atan: x => fromRad(Math.atan(x)),
      ln: Math.log,
      log: x => Math.log10(x),
      sqrt: Math.sqrt,
      abs: Math.abs,
      pi: Math.PI,
      e: Math.E,
      exp: Math.exp,
      pow: Math.pow
    };

    // safe evaluate by creating new Function with scope keys as args
    const fn = new Function(...Object.keys(scope), 'return ('+full+');');
    const res = fn(...Object.values(scope));
    if(!isFinite(res)) state.entry = 'Error';
    else {
      state.entry = (state.fix!==null) ? String(roundTo(res, state.fix)) : String(res);
      state.expr = '';
    }
    updateScreen();
  }catch(e){ state.entry='Error'; updateScreen(); }
}

// memory functions
function memoryPlus(){ let v = Number(state.entry) || 0; state.memory += v; }
function memoryMinus(){ let v = Number(state.entry) || 0; state.memory -= v; }
function memoryRecall(){ state.entry = String(state.memory); updateScreen(); }
function memoryClear(){ state.memory = 0; updateScreen(); }
function swapXwithM(){ let tmp = state.memory; state.memory = Number(state.entry)||0; state.entry = String(tmp); updateScreen(); }

// base conversions (from decimal)
function convertBase(base){
  let v = Number(state.entry);
  if(!isFinite(v)){ state.entry='Error'; updateScreen(); return; }
  if(base===2) state.entry = (v|0).toString(2);
  if(base===8) state.entry = (v|0).toString(8);
  if(base===16) state.entry = (v|0).toString(16).toUpperCase();
  if(base===10) state.entry = String(v);
  updateScreen();
}

// handle clicks
document.querySelector('.keys').addEventListener('click', (ev)=>{
  const btn = ev.target.closest('button');
  if(!btn) return;
  const key = btn.getAttribute('data-key');
  const op = btn.getAttribute('data-op');
  const fn = btn.getAttribute('data-fn');

  if(key) {
    // trig labels like 'sin' are passed as data-key too
    if(['sin','cos','tan'].includes(key)){
      if(state.inv) {
        // inverse trig
        applyUnary(key==='sin'?'asin': key==='cos'?'acos':'atan');
      } else {
        applyUnary(key);
      }
    } else {
      inputDigit(key);
    }
    return;
  }
  if(op) { pushOp(op); return; }
  if(fn){
    switch(fn){
      case 'off': allClear(); break;
      case 'ac': allClear(); break;
      case 'ce': clearEntry(); break;
      case 'del': backspace(); break;
      case 'equals': evaluateAll(); break;
      case 'inv1x':
        if(state.inv) applyUnary('fact'); else applyUnary('1/x');
        break;
      case 'xpow':
        if(state.inv) applyUnary('sqr'); else applyUnary('sqr');
        break;
      case 'xy': applyBinary('**'); break;
      case 'ln': if(state.inv) { /* e^x */ applyBinary('exp('); } else applyUnary('ln'); break;
      case 'log': if(state.inv) { /* 10^x */ /* emulate by pow(10,x) */ state.expr += (state.expr?' ':'') + '10 ** ' + state.entry; state.entry='0'; } else applyUnary('log'); break;
      case 'deg': toggleDRG(); break;
      case 'drg': toggleDRG(); break;
      case 'rm': memoryRecall(); break;
      case 'mplus': memoryPlus(); break;
      case 'mminus': memoryMinus(); break;
      case 'xminusm': swapXwithM(); break;
      case 'hex': convertBase(16); break;
      case 'bin': convertBase(2); break;
      case 'dec': convertBase(10); break;
      case 'flo': alert('FLO - formatting placeholder'); break;
      case 'sci': alert('SCI - formatting placeholder'); break;
      case 'eng': alert('ENG - formatting placeholder'); break;
      case 'neg': applyUnary('neg'); break;
      case 'exp': // treat as 'E' entry for scientific notation
        if(state.entry === '0') state.entry = '0e';
        else state.entry += 'e';
        updateScreen();
        break;
      case 'mode': alert('MODE - not implemented (placeholder)'); break;
      default: break;
    }
    return;
  }
});

// INV toggle
invBtn.addEventListener('click', ()=> toggleInv());

// keyboard support (basic)
document.addEventListener('keydown', (e)=>{
  if(e.key >= '0' && e.key <= '9') inputDigit(e.key);
  if(e.key === '.') inputDigit('.');
  if(e.key === 'Backspace') backspace();
  if(e.key === 'Enter' || e.key === '=') evaluateAll();
  if(e.key === '+') pushOp('+');
  if(e.key === '-') pushOp('-');
  if(e.key === '*') pushOp('*');
  if(e.key === '/') pushOp('/');
});

// init
updateScreen();
