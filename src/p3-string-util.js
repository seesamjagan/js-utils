export class P3StringUtil {

    static randomAlphaNumeric(length) {
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let JUNK_LENGTH = chars.length - 1;
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * JUNK_LENGTH)];
        }
        return result;
    }
}
export default P3StringUtil;
