document.getElementById('genBtn').addEventListener('click', () => {
    const alias = document.getElementById('newAlias').value || 'android';
    const password = document.getElementById('newPass').value;
    const status = document.getElementById('status');

    if (!password) {
        status.innerText = "Please enter a password for the new keystore.";
        return;
    }

    status.innerText = "Generating 2048-bit RSA key... (this may freeze the browser for a second)";

    // 1. Generate Key Pair
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // 2. Create a self-signed certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 25);

    const attrs = [{ name: 'commonName', value: 'Android User' }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);

    // 3. Create PKCS12 Keystore
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, { algorithm: 'aes256', generateLocalKeyId: true, friendlyName: alias });
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

    // 4. Download File
    const blob = new Blob([s2ab(p12Der)], { type: 'application/x-pkcs12' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'upload-keystore.p12';
    link.click();

    status.innerText = "Keystore generated! Use this file in the Signer section.";
});

// Helper: Convert string to ArrayBuffer
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}