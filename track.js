/* Rastreador próprio SeuPodcast/Estúdio Filme — substitui o Tintim.
   Captura os parâmetros do clique (gclid/{keyword}/utm) no primeiro acesso e
   reescreve os botões de WhatsApp para passar pelo CRM (/l), que registra a
   origem e redireciona pro WhatsApp com um código. */
(function () {
  'use strict';
  var BASE = 'https://seupodcast-saas-production.up.railway.app/l';
  var SITE = (location.hostname || '').replace(/^www\./, '');
  // paginas com WhatsApp proprio por caminho (ex.: Estudio Filme Vitoria -> numero de Vitoria)
  if (/^\/vitoria(\/|$)/i.test(location.pathname || '')) SITE += '/vitoria';
  var KEYS = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content',
    'gclid','gclsrc','wbraid','gbraid','gad_source','fbclid','keyword',
    'campaignid','adgroupid','matchtype','device','network','creative'];
  function rc(n){try{var m=document.cookie.match('(?:^|; )'+n+'=([^;]*)');return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}
  function wc(n,v){try{document.cookie=n+'='+encodeURIComponent(v)+';path=/;max-age=31536000;SameSite=Lax';}catch(e){}}
  var qs = new URLSearchParams(location.search || '');
  var cur = {}; KEYS.forEach(function(k){var v=qs.get(k); if(v) cur[k]=v;});
  var ft = {}; try{ ft = JSON.parse(rc('spt_ft')||'{}'); }catch(e){}
  if (Object.keys(cur).length) {
    if (!Object.keys(ft).length) { cur._lp=location.pathname; if(document.referrer) cur._ref=document.referrer; wc('spt_ft', JSON.stringify(cur)); ft=cur; }
    wc('spt_lt', JSON.stringify(cur));
  }
  var lt = {}; try{ lt = JSON.parse(rc('spt_lt')||'{}'); }catch(e){}
  function guessDest(){var p=(location.pathname||'').toLowerCase();var m=['podcast','cursos','lives','conteudo','localizacao','contato'];for(var i=0;i<m.length;i++){if(p.indexOf(m[i])>=0)return m[i];}return '';}
  function params(dest, sOverride){
    var p = new URLSearchParams(); var src = {}; Object.assign(src, ft, lt);
    Object.keys(src).forEach(function(k){ if(src[k] && k.charAt(0)!=='_') p.set(k, src[k]); });
    if(!p.get('utm_term') && p.get('keyword')) p.set('utm_term', p.get('keyword'));
    if(src._ref && !p.get('utm_source')) p.set('ref', src._ref);
    p.set('s', sOverride || SITE); if(dest) p.set('d', dest);
    return p.toString();
  }
  function isTarget(a){var h=a.getAttribute('href')||'';return /tintim\.link|wa\.me|api\.whatsapp\.com/i.test(h)||h.indexOf('/l?')>=0||h.indexOf(BASE)>=0||a.classList.contains('js-wa');}
  function rewrite(){
    var as=document.querySelectorAll('a[href]');
    for(var i=0;i<as.length;i++){var a=as[i]; if(!isTarget(a)) continue;
      var oq=new URLSearchParams((a.getAttribute('href')||'').split('?')[1]||'');
      var d=a.getAttribute('data-wa')||a.getAttribute('data-dest')||oq.get('d')||guessDest();
      a.setAttribute('href', BASE+'?'+params(d, oq.get('s'))); a.setAttribute('rel','noopener'); a.setAttribute('target','_blank');
    }
  }
  /* ---- Envia o clique + a ORIGEM do cliente para o GTM (dataLayer) ---- */
  function attrib(){
    var ft2={},lt2={}; try{ft2=JSON.parse(rc('spt_ft')||'{}');}catch(e){} try{lt2=JSON.parse(rc('spt_lt')||'{}');}catch(e){}
    var s={}; for(var k in ft2)s[k]=ft2[k]; for(var k2 in lt2)s[k2]=lt2[k2];
    var o={
      page_path: location.pathname, page_location: location.href, referrer: document.referrer||'',
      utm_source: s.utm_source||'', utm_medium: s.utm_medium||'', utm_campaign: s.utm_campaign||'',
      utm_term: s.utm_term||s.keyword||'', utm_content: s.utm_content||'',
      gclid: s.gclid||'', gbraid: s.gbraid||'', wbraid: s.wbraid||'', fbclid: s.fbclid||''
    };
    o.origem = o.utm_source ? (o.utm_source + (o.utm_medium?(' / '+o.utm_medium):''))
             : (o.gclid||o.gbraid||o.wbraid) ? 'google / cpc (Ads)'
             : o.fbclid ? 'meta / paid'
             : (document.referrer ? 'referral' : 'direto');
    return o;
  }
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if(!a || !isTarget(a)) return;
    var botao = (a.getAttribute('data-loc') || (a.textContent||'').trim() || 'whatsapp').slice(0,60);
    var dl = window.dataLayer = window.dataLayer || [];
    var d = attrib(); d.event='clique_contato'; d.metodo='whatsapp'; d.botao=botao;
    dl.push(d);
  }, true);

  if(document.readyState!=='loading') rewrite(); else document.addEventListener('DOMContentLoaded', rewrite);
})();
