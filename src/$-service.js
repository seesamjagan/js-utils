import $ from 'jquery';

// JQuery Implementation
export class $Service {
    post(url, data, callback, ignoreAbortedRequest) {
        return $.ajax({
            url: url,
            data: data,
            type: 'post',
            success: (data, textStatus, jqXHR) => this.successHandler(data, textStatus, jqXHR, callback)
        }).fail((jqXHR, textStatus, error) => this.failHandler(jqXHR, textStatus, error, callback, ignoreAbortedRequest));
    }

    successHandler(data, textStatus, jqXHR, callback) {
        callback(typeof (data) === "string" ? JSON.parse(data) : data);
    }

    failHandler(jqXHR, textStatus, error, callback, ignoreAbortedRequest) {
        //let ignoreStatusCode = [404, 500, 0];
        const ABORT = 'abort';
        if (textStatus === ABORT && ignoreAbortedRequest) {
            // request aborted.
            // ignore the callback.
        } else {
            let message = '';
            switch (jqXHR.status) {
                case 0:
                    message = textStatus === ABORT ? 'Request aborted!' : ('Network error! ' + error || '');
                    break;
                case 404:
                    message = '404: Requested resource not found!';
                    break;
                case 500:
                    message = '500: Internal server error! ' + error || '';
                    break;
                default:
                    message = 'Unknown Network error!';
            }
            callback({ status: false, errorMessage: message, message, error: error, textStatus });
        }
    }

    get(url, data, callback, ignoreAbortedRequest) {
        return $.ajax({
            url: url,
            data: data,
            type: 'get',
            success: (data, textStatus, jqXHR) => this.successHandler(data, textStatus, jqXHR, callback)
        }).fail((jqXHR, textStatus, error) => this.failHandler(jqXHR, textStatus, error, callback, ignoreAbortedRequest));
    }
}

export default $Service;