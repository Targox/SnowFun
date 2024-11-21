(async function() {
  const scriptSrc = document.currentScript?.src;
  console.log('Saved script URL:', scriptSrc);
  
  // Laad ThumbmarkJS
  await import('https://cdn.jsdelivr.net/npm/@thumbmarkjs/thumbmarkjs/dist/thumbmark.umd.js');
  ThumbmarkJS.setOption('exclude', ['audio.sampleHash', 'canvas.commonImageDataHash']);
  const xanoEndpoint = 'https://x8ki-letl-twmt.n7.xano.io/api:eLhWEdSz/visit';
  
  function getVisitorID() {
    let visitorID = document.cookie.replace(/(?:(?:^|.*;\s*)visitorID\s*=\s*([^;]*).*$)|^.*$/, "$1");
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 13);
    
    if (!visitorID) {
      visitorID = 'fn_' + Math.random().toString(36).substr(2, 9);
    }
    document.cookie = "visitorID=" + visitorID + "; path=/; expires=" + expires.toUTCString();
    return visitorID;
  }
  
  async function fetchIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("IP fetch failed", error);
      return null;
    }
  }

  function getUserId(scriptSrc) {
    if (!scriptSrc) {
      console.log('Script URL not found');
      return null;
    }
    try {
      const url = new URL(scriptSrc);
      const userId = new URLSearchParams(url.search).get('id');
      console.log('Found user ID:', userId);
      return userId;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  }

  async function initializeTracker(email = null) {
    const userId = getUserId(scriptSrc);
    
    if (!userId) {
      console.error('Tracking ID niet gevonden');
      return;
    }

    try {
      const [fingerprint, ipAddress] = await Promise.all([
        ThumbmarkJS.getFingerprint(),
        fetchIPAddress()
      ]);
      const visitorID = getVisitorID();
      
      if (ipAddress) {
        const payload = {
          visitor_id: visitorID,
          fp: fingerprint,
          ipAddress: ipAddress,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          url: window.location.href,
          user_id: parseInt(userId),
          email: email // Voeg het e-mailadres toe aan de payload
        };

        const response = await fetch(xanoEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log("Tracking data verzonden:", data);
      }
    } catch (error) {
      console.error("Fout bij verzenden tracking data:", error);
    }
  }

  // Voeg een event listener toe aan het e-mailveld
  const emailField = document.querySelector('input[type="email"]');
  
  if (emailField) {
    // Eventlistener voor het verlaten van het veld
    emailField.addEventListener('blur', () => {
      if (emailField.value) {
        initializeTracker(emailField.value);
      }
    });
  }

  // Start de tracker zonder e-mailadres
  initializeTracker();

  window.addEventListener('hashchange', () => {
    console.log("URL-hash gewijzigd:", window.location.href);
    initializeTracker();
  });
})();
