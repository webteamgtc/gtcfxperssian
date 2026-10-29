/**
 * Inline <head> script, runs before the first paint:
 *  - data-intro: whether the opening intro plays (once per session, see IntroLoader.jsx)
 *  - data-cookie: 'ok' when the visitor already answered the cookie banner (Footer.jsx → CookieBanner),
 *    so the banner (rendered in the HTML, painted with the page) is hidden without a flash
 */
export const INTRO_SCRIPT = `try{var d=document.documentElement,p=!sessionStorage.getItem('gtc_intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.intro=p?'play':'skip'}catch(e){document.documentElement.dataset.intro='skip'}try{document.documentElement.dataset.cookie=localStorage.getItem('gtc-cookie')==='1'?'ok':'ask'}catch(e){}`;
