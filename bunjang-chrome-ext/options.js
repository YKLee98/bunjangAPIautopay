// options.js
document.addEventListener('DOMContentLoaded', () => {
  // 저장된 값 불러오기
  chrome.storage.local.get([
    'accessKey', 'secretKey', 'recipient', 'phone', 'address', 'zipCode'
  ], (items) => {
    document.getElementById('accessKey').value = items.accessKey || '';
    document.getElementById('secretKey').value = items.secretKey || '';
    document.getElementById('recipient').value = items.recipient || '';
    document.getElementById('phone').value = items.phone || '';
    document.getElementById('address').value = items.address || '';
    document.getElementById('zipCode').value = items.zipCode || '';
  });

  document.getElementById('optionsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    chrome.storage.local.set({
      accessKey: document.getElementById('accessKey').value.trim(),
      secretKey: document.getElementById('secretKey').value.trim(),
      recipient: document.getElementById('recipient').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address: document.getElementById('address').value.trim(),
      zipCode: document.getElementById('zipCode').value.trim()
    }, () => {
      document.getElementById('status').textContent = '✅ 저장되었습니다!';
      setTimeout(() => document.getElementById('status').textContent = '', 2000);
    });
  });
});