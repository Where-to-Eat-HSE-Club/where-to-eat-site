const passCodeHash = "ddbe7b29ea6025d731132854b72ceca46af449d55482c819561381a92da6aa1ad5e7009e21fe30bb269c71f7d01d4713c0259d720250c0ee1cfa8d4b5f8c9245"

function sha512(str) {
  return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
    return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
  });
}

function promptAuth() {
    let authCode = window.prompt("Введите код авторизации")
    sha512(authCode).then(authCodeHash => {
        console.log(authCode)
        console.log(authCodeHash)
        if (authCodeHash === passCodeHash) {
            window.location.href = `/admin?passkey=${authCode}`;
        } else {
            alert("Код авторизации не подходит")
        }
    })

}