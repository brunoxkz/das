/**
 * GERADOR DE CÓDIGOS DE PIXELS DE RASTREAMENTO
 * Gera códigos completos para inserção automática apenas na URL pública
 */

export interface PixelConfig {
  id: string;
  name: string;
  type: string;
  mode: 'normal' | 'api';
  value: string;
  accessToken?: string;
  testEventCode?: string;
}

export function generatePixelCode(pixel: PixelConfig, delay: boolean = false): string {
  const delayMs = delay ? 3000 : 0;
  
  switch (pixel.type) {
    case 'facebook':
      return generateFacebookPixelCode(pixel, delayMs);
    case 'google':
      return generateGoogleAdsCode(pixel, delayMs);
    case 'ga4':
      return generateGA4Code(pixel, delayMs);
    case 'taboola':
      return generateTaboolaCode(pixel, delayMs);
    case 'pinterest':
      return generatePinterestCode(pixel, delayMs);
    case 'linkedin':
      return generateLinkedInCode(pixel, delayMs);
    case 'outbrain':
      return generateOutbrainCode(pixel, delayMs);
    case 'mgid':
      return generateMgidCode(pixel, delayMs);
    case 'tiktok':
      return generateTikTokCode(pixel, delayMs);
    case 'snapchat':
      return generateSnapchatCode(pixel, delayMs);
    default:
      return '';
  }
}

function generateFacebookPixelCode(pixel: PixelConfig, delay: number): string {
  const pixelId = pixel.value;
  const isApiMode = pixel.mode === 'api';
  
  const baseCode = `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

function initFacebookPixel() {
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
  
  // Evento personalizado para Quiz View
  fbq('track', 'ViewContent', {
    content_type: 'quiz',
    content_name: document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initFacebookPixel, ${delay});` : 'initFacebookPixel();'}
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
       src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
</noscript>
<!-- End Facebook Pixel Code -->`;

  if (isApiMode && pixel.accessToken) {
    return baseCode + `
<!-- Facebook Conversions API -->
<script>
window.fbPixelAPI = {
  accessToken: '${pixel.accessToken}',
  pixelId: '${pixelId}',
  testEventCode: '${pixel.testEventCode || ''}',
  
  sendEvent: function(eventName, eventData) {
    const data = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: window.location.href,
        user_data: {
          client_ip_address: '{{client_ip}}',
          client_user_agent: navigator.userAgent,
          fbc: this.getFbc(),
          fbp: this.getFbp()
        },
        custom_data: eventData || {}
      }],
      test_event_code: this.testEventCode
    };
    
    // Enviar via API (implementar backend endpoint)
    fetch('/api/facebook-conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  
  getFbc: function() {
    const fbc = document.cookie.match(/(?:^|;)\\s*_fbc\\s*=\\s*([^;]+)/);
    return fbc ? fbc[1] : null;
  },
  
  getFbp: function() {
    const fbp = document.cookie.match(/(?:^|;)\\s*_fbp\\s*=\\s*([^;]+)/);
    return fbp ? fbp[1] : null;
  }
};

// Enviar evento via API após delay
${delay > 0 ? `setTimeout(() => {
  window.fbPixelAPI.sendEvent('PageView', {
    content_type: 'quiz',
    content_name: document.title || 'Quiz View'
  });
}, ${delay});` : `window.fbPixelAPI.sendEvent('PageView', {
  content_type: 'quiz',
  content_name: document.title || 'Quiz View'
});`}
</script>
<!-- End Facebook Conversions API -->`;
  }
  
  return baseCode;
}

function generateGoogleAdsCode(pixel: PixelConfig, delay: number): string {
  const conversionId = pixel.value;
  const isApiMode = pixel.mode === 'api';
  
  const baseCode = `
<!-- Google Ads Conversion Tracking -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${conversionId}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

function initGoogleAds() {
  gtag('js', new Date());
  gtag('config', '${conversionId}');
  
  // Evento personalizado para Quiz View
  gtag('event', 'page_view', {
    'send_to': '${conversionId}',
    'content_type': 'quiz',
    'content_name': document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initGoogleAds, ${delay});` : 'initGoogleAds();'}
</script>
<!-- End Google Ads Conversion Tracking -->`;

  if (isApiMode) {
    return baseCode + `
<!-- Google Ads Enhanced Conversions -->
<script>
window.googleAdsAPI = {
  conversionId: '${conversionId}',
  
  sendEnhancedConversion: function(conversionData) {
    gtag('event', 'conversion', {
      'send_to': '${conversionId}',
      'value': conversionData.value || 0,
      'currency': conversionData.currency || 'BRL',
      'transaction_id': conversionData.transaction_id || Date.now().toString(),
      'user_data': {
        'email_address': conversionData.email,
        'phone_number': conversionData.phone,
        'first_name': conversionData.first_name,
        'last_name': conversionData.last_name
      }
    });
  }
};
</script>
<!-- End Google Ads Enhanced Conversions -->`;
  }
  
  return baseCode;
}

function generateGA4Code(pixel: PixelConfig, delay: number): string {
  const measurementId = pixel.value;
  
  return `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

function initGA4() {
  gtag('js', new Date());
  gtag('config', '${measurementId}', {
    'send_page_view': true,
    'custom_map': {
      'custom_parameter_1': 'quiz_view'
    }
  });
  
  // Evento personalizado para Quiz View
  gtag('event', 'view_item', {
    'item_category': 'quiz',
    'item_name': document.title || 'Quiz View',
    'content_type': 'quiz'
  });
}

${delay > 0 ? `setTimeout(initGA4, ${delay});` : 'initGA4();'}
</script>
<!-- End Google Analytics 4 -->`;
}

function generateTaboolaCode(pixel: PixelConfig, delay: number): string {
  const accountId = pixel.value;
  
  return `
<!-- Taboola Pixel -->
<script type="text/javascript">
window._tfa = window._tfa || [];
window._tfa.push({notify: 'event', name: 'page_view', id: ${accountId}});
!function (t, f, a, x) {
  if (!document.getElementById(x)) {
    t.async = 1; t.src = a; t.id = x;
    f.parentNode.insertBefore(t, f);
  }
}(document.createElement('script'),
  document.getElementsByTagName('script')[0],
  '//cdn.taboola.com/libtrc/unip/${accountId}/tfa.js',
  'tb_tfa_script');

function initTaboola() {
  window._tfa.push({notify: 'event', name: 'page_view', id: ${accountId}});
  
  // Evento personalizado para Quiz View
  window._tfa.push({
    notify: 'event', 
    name: 'quiz_view', 
    id: ${accountId},
    content_type: 'quiz'
  });
}

${delay > 0 ? `setTimeout(initTaboola, ${delay});` : 'initTaboola();'}
</script>
<!-- End Taboola Pixel -->`;
}

function generatePinterestCode(pixel: PixelConfig, delay: number): string {
  const tagId = pixel.value;
  
  return `
<!-- Pinterest Pixel -->
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
var n=window.pintrk;n.queue=[],n.version="3.0";
var t=document.createElement("script");t.async=!0,t.src=e;
var r=document.getElementsByTagName("script")[0];
r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");

function initPinterest() {
  pintrk('load', '${tagId}', {em: '<user_email_address>'});
  pintrk('page');
  
  // Evento personalizado para Quiz View
  pintrk('track', 'viewcategory', {
    category: 'quiz',
    content_name: document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initPinterest, ${delay});` : 'initPinterest();'}
</script>
<noscript>
  <img height="1" width="1" style="display:none;" alt="" 
       src="https://ct.pinterest.com/v3/?event=init&tid=${tagId}&noscript=1" />
</noscript>
<!-- End Pinterest Pixel -->`;
}

function generateLinkedInCode(pixel: PixelConfig, delay: number): string {
  const partnerId = pixel.value;
  
  return `
<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "${partnerId}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
function initLinkedIn() {
  (function(l) {
    if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
    window.lintrk.q=[]}
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript";b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);
  })(window.lintrk);
  
  lintrk('track', 'lt.viewContent', {
    'content_type': 'quiz',
    'content_name': document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initLinkedIn, ${delay});` : 'initLinkedIn();'}
</script>
<noscript>
  <img height="1" width="1" style="display:none;" alt="" 
       src="https://px.ads.linkedin.com/collect/?pid=${partnerId}&fmt=gif" />
</noscript>
<!-- End LinkedIn Insight Tag -->`;
}

function generateOutbrainCode(pixel: PixelConfig, delay: number): string {
  const marketerId = pixel.value;
  
  return `
<!-- Outbrain Pixel -->
<script type="text/javascript">
function initOutbrain() {
  !function(_window, _document) {
    var OB_ADV_ID = '${marketerId}';
    if (_window.obApi) {
      var toArray = function(object) {
        return Object.prototype.toString.call(object) === '[object Array]' ? object : [object];
      };
      _window.obApi.marketerId = toArray(_window.obApi.marketerId).concat(toArray(OB_ADV_ID));
      return;
    }
    var api = _window.obApi = function() {
      api.dispatch ? api.dispatch.apply(api, arguments) : api.queue.push(arguments);
    };
    api.version = '1.1';
    api.loaded = true;
    api.marketerId = OB_ADV_ID;
    api.queue = [];
    var tag = _document.createElement('script');
    tag.async = true;
    tag.src = '//amplify.outbrain.com/cp/obtp.js';
    tag.type = 'text/javascript';
    var script = _document.getElementsByTagName('script')[0];
    script.parentNode.insertBefore(tag, script);
  }(window, document);
  
  obApi('track', 'PAGE_VIEW');
  
  // Evento personalizado para Quiz View
  obApi('track', 'VIEW_CONTENT', {
    content_type: 'quiz',
    content_name: document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initOutbrain, ${delay});` : 'initOutbrain();'}
</script>
<!-- End Outbrain Pixel -->`;
}

function generateMgidCode(pixel: PixelConfig, delay: number): string {
  const containerId = pixel.value;
  
  return `
<!-- MGID Pixel -->
<script type="text/javascript">
function initMgid() {
  var mg = document.createElement('script');
  mg.type = 'text/javascript';
  mg.async = true;
  mg.src = 'https://servicer.mgid.com/mgid.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(mg);
  
  window.mgid_pixel = {
    containerId: '${containerId}',
    track: function(event, data) {
      if (window.mgid && window.mgid.track) {
        window.mgid.track(event, data);
      }
    }
  };
  
  // Evento personalizado para Quiz View
  setTimeout(function() {
    if (window.mgid_pixel) {
      window.mgid_pixel.track('PAGE_VIEW', {
        content_type: 'quiz',
        content_name: document.title || 'Quiz View'
      });
    }
  }, 1000);
}

${delay > 0 ? `setTimeout(initMgid, ${delay});` : 'initMgid();'}
</script>
<!-- End MGID Pixel -->`;
}

function generateTikTokCode(pixel: PixelConfig, delay: number): string {
  const pixelId = pixel.value;
  
  return `
<!-- TikTok Pixel -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

function initTikTok() {
  ttq.load('${pixelId}');
  ttq.page();
  
  // Evento personalizado para Quiz View
  ttq.track('ViewContent', {
    content_type: 'quiz',
    content_name: document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initTikTok, ${delay});` : 'initTikTok();'}
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel -->`;
}

function generateSnapchatCode(pixel: PixelConfig, delay: number): string {
  const pixelId = pixel.value;
  
  return `
<!-- Snapchat Pixel -->
<script type='text/javascript'>
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');

function initSnapchat() {
  snaptr('init', '${pixelId}', {
    'user_email': '__INSERT_USER_EMAIL__'
  });
  snaptr('track', 'PAGE_VIEW');
  
  // Evento personalizado para Quiz View
  snaptr('track', 'VIEW_CONTENT', {
    'content_type': 'quiz',
    'content_name': document.title || 'Quiz View'
  });
}

${delay > 0 ? `setTimeout(initSnapchat, ${delay});` : 'initSnapchat();'}
</script>
<!-- End Snapchat Pixel -->`;
}

// Função para gerar todos os códigos de uma vez
export function generateAllPixelCodes(pixels: PixelConfig[], delay: boolean = false): string {
  return pixels
    .filter(pixel => pixel.value.trim() !== '')
    .map(pixel => generatePixelCode(pixel, delay))
    .join('\n\n');
}

// Função para inserir códigos no head da página
export function insertPixelCodes(codes: string): void {
  // Remove scripts existentes do Vendzz
  const existingScripts = document.querySelectorAll('script[data-vendzz-pixel]');
  existingScripts.forEach(script => script.remove());
  
  // Cria container para os códigos
  const container = document.createElement('div');
  container.setAttribute('data-vendzz-pixel', 'true');
  container.innerHTML = codes;
  
  // Insere no head
  document.head.appendChild(container);
  
  // Executa scripts inline
  const scripts = container.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src) {
      // Script externo
      const newScript = document.createElement('script');
      newScript.src = script.src;
      newScript.async = true;
      newScript.setAttribute('data-vendzz-pixel', 'true');
      document.head.appendChild(newScript);
    } else {
      // Script inline
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      newScript.setAttribute('data-vendzz-pixel', 'true');
      document.head.appendChild(newScript);
    }
  });
}