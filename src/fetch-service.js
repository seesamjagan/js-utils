const Method = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

const Mode = {
    CORS: 'cors',
    NO_CORS: 'no-cors',
    SAME_ORIGIN: 'same-origin'
}

const Cache = {
    DEFAULT: 'default',
    NO_CACHE: 'no-cache',
    RELOAD: 'reload',
    FORCE_CACHE: 'force-cache',
    ONLY_IF_CACHED: 'only-if-cached',
}

const ContentType = {
    JSON: 'application/json; charset=utf-8',
    FORM_DATA: 'application/x-www-form-urlencoded',
    TEXT: 'text/plain',
    HTML: 'text/html',
    OCTET_STREAM: 'application/octet-stream'
}

const Redirect = {
    MANUAL: 'manual',
    FOLLOW: 'follow',
    ERROR: 'error',
}

const Referrer = {
    NO_REFERRER: 'no-referrer',
    CLIENT: 'client',
}

const Credentials = {
    INCLUDE: 'include',
    SAME_ORIGIN: 'same-origin',
    OMIT: 'omit'
}

class ResponceVo {
    constructor(status, data, message=null, code=0) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.code = code;
    }
}

export class Fetch {
    static post = (url, payload, signal=null) => {

        const headers = new Headers({
            "Content-Type": ContentType.JSON
        });

        return fetch(url, {
            method: Method.POST,
            mode: Mode.CORS,
            cache: Cache.NO_CACHE,
            headers: headers,
            redirect: Redirect.FOLLOW,
            referrer: Referrer.NO_REFERRER,
            body: JSON.stringify(payload),
            credentials: Credentials.INCLUDE,
            signal: signal, // which will be used to abort the request.
        })
        .then(response => {
            if(response.ok) {
                var contentType = response.headers.get("content-type");
                if(contentType && !contentType.includes("application/json")) {
                    // we are expecting only the JSON response.
                    throw new Error('Invalid Content-Type in response body.');
                }
                return response.json();
            }
            throw new Error(`Got Error with ${response.status}: ${response.statusText} status code.`);
        })
        .catch(error=>error)
        .then(resultOrError=>{
            let result = resultOrError;
            if(resultOrError instanceof Error) {
                result = new ResponceVo(false, resultOrError, resultOrError.message);
            }
            return result;
        });
    }
}

export default Fetch;