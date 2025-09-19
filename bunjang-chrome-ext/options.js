document.addEventListener('DOMContentLoaded', () => {
  // 저장된 값 불러오기
  chrome.storage.local.get([
    'accessKey', 'secretKey', 'recipient', 'phone', 'address1', 'address2', 'zipCode'
  ], (items) => {
    document.getElementById('accessKey').value = items.accessKey || '';
    document.getElementById('secretKey').value = items.secretKey || '';
    document.getElementById('recipient').value = items.recipient || '';
    document.getElementById('phone').value = items.phone || '';
    document.getElementById('address1').value = items.address1 || '';
    document.getElementById('address2').value = items.address2 || '';
    document.getElementById('zipCode').value = items.zipCode || '';
  });

  document.getElementById('optionsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    chrome.storage.local.set({
      accessKey: document.getElementById('accessKey').value.trim(),
      secretKey: document.getElementById('secretKey').value.trim(),
      recipient: document.getElementById('recipient').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      address1: document.getElementById('address1').value.trim(),
      address2: document.getElementById('address2').value.trim(),
      zipCode: document.getElementById('zipCode').value.trim()
    }, () => {
      document.getElementById('status').textContent = '✅ 저장되었습니다!';
      setTimeout(() => document.getElementById('status').textContent = '', 2000);
    });
  });
});
