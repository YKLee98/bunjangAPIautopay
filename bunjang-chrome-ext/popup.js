// popup.js

// 옵션 페이지로 이동
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

// 저장된 배송지/키 자동 불러오기(없으면 경고)
let saved = {};
chrome.storage.local.get([
  'accessKey', 'secretKey', 'recipient', 'phone', 'address', 'zipCode'
], (items) => {
  saved = items;
});

function base64ToUint8Array(base64) {
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

// JWT 생성 (HS256)
async function generateJWT(accessKey, secretKeyBase64) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    accessKey,
    iat: Math.floor(Date.now() / 1000)
  };
  const toBase64 = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = toBase64(header);
  const payloadB64 = toBase64(payload);
  const data = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToUint8Array(secretKeyBase64),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sigB64}`;
}

document.getElementById('buyForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  // 최신 저장값 불러오기
  chrome.storage.local.get([
    'accessKey', 'secretKey', 'recipient', 'phone', 'address', 'zipCode'
  ], async (items) => {
    const accessKey = items.accessKey || '';
    const secretKey = items.secretKey || '';
    const recipient = items.recipient || '';
    const phone = items.phone || '';
    const address = items.address || '';
    const zipCode = items.zipCode || '';
    const pid = document.getElementById('pid').value.trim();
    const price = document.getElementById('price').value.trim();
    const deliveryPrice = document.getElementById('deliveryPrice').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = '구매 요청 중...';

    if (!accessKey || !secretKey || !recipient || !phone || !address || !zipCode) {
      resultDiv.textContent = '❌ 먼저 [설정]에서 API키와 배송지 정보를 저장하세요!';
      return;
    }

    try {
      const jwt = await generateJWT(accessKey, secretKey);
      const payload = {
        product: {
          id: parseInt(pid),
          price: parseInt(price)
        },
        deliveryPrice: parseInt(deliveryPrice),
        recipient: {
          name: recipient,
          phone: phone,
          address: {
            zipCode: zipCode,
            address: address
          }
        },
        message: "크롬 확장앱 자동구매",
        agreeToTerms: true
      };

      const res = await fetch('https://openapi.bunjang.co.kr/api/v2/orders', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.data && data.data.id) {
        resultDiv.textContent = `✅ 구매 성공! 주문 ID: ${data.data.id}`;
      } else {
        resultDiv.textContent = `❌ 구매 실패: ${data.message || JSON.stringify(data)}`;
      }
    } catch (err) {
      resultDiv.textContent = '❌ 오류: ' + err.message;
    }
  });
});