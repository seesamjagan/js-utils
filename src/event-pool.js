
export class EventPod {
    constructor(event = null, callback = null, order = 0, initiator = null) {
        this.event = event;
        this.callback = callback;
        this.order = order;
        this.initiator = initiator;

        this.$isBlasted = false;
    }

    get event() { return this.$event; }
    set event(value) { this.$event = value; }

    get callback() { return this.$callback; }
    set callback(value) { this.$callback = value; }

    get order() { return this.$order; }
    set order(value) { this.$order = value; }

    get initiator() { return this.$initiator; }
    set initiator(value) { this.$initiator = value; }

    blast() {  this.$isBlasted = true; }
    get isBlasted() { return this.$isBlasted; }
}

export const map = {};

/**
 * 
 * @author : சாமி. ஜெகன் லங்கா. (Jagan Langa S.)
 */
export class EventPool {

    constructor() {
        throw new Error('EventPool is a static class. Do not create instance for this class');
    }

    /**
     * fires an event to trigger the event callbacks
     * @param {string} event event name
     * @param {any} eventData data that is passed on to the event callback
     * @param {any} initiator initiator of the event
     */
    static fire(event, eventData, initiator = null) {
        if (!event) {
            // drop the fire command if there is no valid event
            return false;
        }

        if (map.hasOwnProperty(event) === false) {
            // if no one is looking for this event, then quit.
            return false;
        }

        let pool = map[event];

        let length = pool.length;

        if (length === 0) {
            // if no one is looking for this event, then quit.
            return false;
        }

        let count = 0, pod;

        while (count < length) {
            pod = pool[count++];
            if(pod.initiator === null || pod.initiator === initiator) {
                pod.callback(eventData, pod);
                if (pod.isBlasted) {
                    // if the current pod is blasted, stop firing the remaining pods in the pool
                    return count;
                }
            }
        }

        return count;
    }

    /**
     * add a watch to an event.
     * @param {string} event event name
     * @param {function} callback function to be called when the event is fired
     * @param {number} order order of execuiting the callbacks for the event
     * @param {any} initiator initiator of the event. can be string or object or any.
     */
    static watch(event, callback, order = 0, initiator = null) {

        if (!event || !callback) {
            // event or callback is invalid. drop the watch request
            return false;
        }

        if (map.hasOwnProperty(event) === false) {
            map[event] = [];
        }

        let pool = map[event];

        if (pool.filter(pod => (pod.callback === callback && pod.initiator === initiator)).length > 0) {
            // if we already have the same callback in the pool for this event for the same initaitor, then quit.
            return false;
        }

        let pod = new EventPod(event, callback, order, initiator);
        pool.push(pod);

        // sort the pool by "order", to get execuited by the order user asked.
        // we are sorting here instead of sorting in "fire()" method to avoid the repeated sort event on each "fire()" call.
        map[event] = pool.sort((podA, podB) => podA.order - podB.order);

        return () => {
            let index = pool.indexOf(pod);
            if (index >= 0) {
                pool.splice(index, 1);
            }
        };
    }

    static dropAll(event = null) {
        if (event) {
            // drop all the watch's only of the given event
            delete map[event];
        } else {
            // drop all the watch's of all the actions
            Object.keys(map).forEach(event => {
                delete map[event];
            });
        }
    }
}

export default EventPool;