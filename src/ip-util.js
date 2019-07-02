export class IPv4Util {
    static isValid(ip) {
        let regExp = /^((1?\d\d?|2[0-4]\d|25[0-5]).){3}(1?\d\d?|2[0-4]\d|2‌​5[0-5])$/;
        //regExp = /^((1?\d\d?|2[0-4]\d|25[0-5]).){3}(1?\d\d?|2[0-4]\d|25[0-5])$/;
        regExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        //regExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
        let valid = regExp.test(ip);
        switch (ip) {
            case '0.0.0.0':
            case '1.1.1.1':
            case '255.255.255.255':
            case '127.0.0.1':
                valid = false;
                break;
            default:
        }

        return valid;
    }

    /**
     * checks whether the IP value(SAN) in within the range of Subnetmask and network IP
     */
    static checkIPRange = (ip, subnetMask, network) => {
        let subNetMask = IPv4Util.convertIPintoInteger(IPv4Util.splitIPAddress(subnetMask));
        let netIPValue = IPv4Util.convertIPintoInteger(IPv4Util.splitIPAddress(network));
        let sanIPValue = IPv4Util.convertIPintoInteger(IPv4Util.splitIPAddress(ip));
        return ((netIPValue & subNetMask) === (sanIPValue & subNetMask));
    }

    static splitIPAddress = (ipAddress) => {
        let parts = (ipAddress + '').split('.', 4);
        return parts;
    }

    // makes the 4 octent values of IP into a single value
    static convertIPintoInteger = (ipArray) => {
        return ((ipArray[0] & 0xFF) << 24) | ((ipArray[1] & 0xFF) << 16) | ((ipArray[2] & 0xFF) << 8) | ((ipArray[3] & 0xFF) << 0);
    }

    static validateGateway(gateway) {
        gateway = gateway.trim()
        if (gateway === "0.0.0.0") {
            return "";
        }
        return gateway;
    }

    static calculateNetworkAddress(ipArr, subnetMask) {
        var str = "";
        for (var i = 0; i < ipArr.length; i++) {
            var ipInt = Number(ipArr[i]);
            var subnetInt = Number(subnetMask[i]);
            var networkInt = (ipInt & subnetInt);
            if (i < (ipArr.length - 1)) {
                str += networkInt + ".";
            } else {
                str += networkInt;
            }
        }
        return str;
    }
}
export default IPv4Util;