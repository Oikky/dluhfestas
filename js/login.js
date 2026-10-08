/* Login com Google no site (Firebase Auth, o mesmo projeto do admin). É obrigatório para mandar
   o pedido: o nome e o e-mail da conta vão no pedido e chegam preenchidos no checkout do Pix.
   window.DLuhLogin = { usuario, entrar, sair, token, aoMudar } */
(function () {
  "use strict";
  const V = "10.12.0";
  const CONFIG = {
    apiKey: "AIzaSyAeUAqcEZojhEqrsubbV0nx6zmN-4hcBX0",
    authDomain: "dluh-festas-reserva.firebaseapp.com",
    projectId: "dluh-festas-reserva",
    appId: "1:471184213272:web:a17042edce2d45b0500a6d"
  };
  /* Navegador de dentro do Instagram/Facebook/WhatsApp: o Google não deixa entrar ali. */
  const naoDeixaGoogle = /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\//i.test(navigator.userAgent);

  let atual = null;
  const ouvintes = new Set();
  const pronto = (async () => {
    const [{ initializeApp }, A] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`)
    ]);
    const auth = A.getAuth(initializeApp(CONFIG, "site"));
    auth.languageCode = "pt";
    await A.setPersistence(auth, A.browserLocalPersistence);
    await new Promise(ok => A.onAuthStateChanged(auth, u => { atual = u; ouvintes.forEach(f => f(u)); ok(); }));
    return { auth, A };
  })();

  async function entrar() {
    const { auth, A } = await pronto;
    const provedor = new A.GoogleAuthProvider();
    provedor.setCustomParameters({ prompt: "select_account" });
    try { return (await A.signInWithPopup(auth, provedor)).user; }
    catch (e) {
      // Pop-up bloqueado (celular): entra pela própria página e volta pra cá.
      if (e && /popup-blocked|operation-not-supported/.test(e.code || "")) return A.signInWithRedirect(auth, provedor);
      throw e;
    }
  }
  const sair = async () => { const { auth, A } = await pronto; return A.signOut(auth); };
  const token = async () => { await pronto; return atual ? atual.getIdToken() : null; };
  function aoMudar(f) { ouvintes.add(f); pronto.then(() => f(atual)); return () => ouvintes.delete(f); }

  window.DLuhLogin = { usuario: () => atual, entrar, sair, token, aoMudar, naoDeixaGoogle, pronto };
})();
