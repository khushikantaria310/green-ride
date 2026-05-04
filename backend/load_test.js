import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  // Lower it to 10 users, which SQLite can handle without timing out
  vus: 10,
  duration: '5s',
};

// ⚠️ PASTE YOUR LONG JWT TOKEN HERE (Keep the single quotes around it)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZAZ3JlZW5yaWRlLmNvbSIsImV4cCI6MTc3NzkwNjY0MX0.mD00a5_xG9MkQjkgiUEU3yM5vc7ViK1oKP3gLW-6QAg'; 

export default function () {
  // Station ID 1 (Indiranagar Node - starts with 10 slots)
  const url = 'http://127.0.0.1:5000/api/bookings?station_id=1';
  
  const payload = JSON.stringify({});

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);

  // Check if the request either succeeded (200) or was correctly rejected (400)
  check(res, {
    'Success (Slot Secured)': (r) => r.status === 200,
    'Rejected (No Slots Left)': (r) => r.status === 400,
  });

  // Short sleep to simulate rapid retry
  sleep(0.1);
}
