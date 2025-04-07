const sendTreoSaTreFlow = require('../flows/treoSaTreFlow');

// ... existing code ...

async function handleMessage(sender_psid, received_message) {
  // ... existing code ...
  
  switch(intent) {
    // ... other cases ...
    
    case 'treo_sa_tre':
      await sendTreoSaTreFlow(sender_psid);
      break;
      
    // ... other cases ...
  }
}