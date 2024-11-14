// tracker.js
(async function() {
  // Direct de script URL opslaan voordat we iets anders doen
  const scriptSrc = document.currentScript?.src;
  console.log('Saved script URL:', scriptSrc);

  // Laad ThumbmarkJS
  await import('https://cdn.jsdelivr.net/npm/@thumbmarkjs/thumbmarkjs/dist/thumbmark.umd.js');
  ThumbmarkJS.setOption('exclude', ['audio.sampleHash', 'canvas.commonImageDataHash']);

  const xanoEndpoint = 'https://x8ki-letl-twmt.n7.xano.io/api:eLhWEdSz/visit';
  
  function getVisitorID() {
    let visitorID = document.cookie.replace(/(?:(?:^|.*;\s*)visitorID\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (!visitorID) {
      visitorID = 'fn_' + Math.random().toString(36).substr(2, 9);
      document.cookie = "visitorID=" + visitorID + "; path=/";
    }
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

  async function initializeTracker() {
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
          user_id: parseInt(userId)
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

  // Start de tracker
  initializeTracker();
})();
