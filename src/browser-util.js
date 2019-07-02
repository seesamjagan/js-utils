export class BrowserUtil {

    static isIE() {
        var isIE = '-ms-scroll-limit' in window.document.documentElement.style && '-ms-ime-align' in window.document.documentElement.style;
        return isIE;
    }
}
export default BrowserUtil;
