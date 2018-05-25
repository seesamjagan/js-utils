
import expect from 'expect';

export class EventPod {
    constructor(event = null, callback = null, order = 0, initiator = null) {
        this.event;
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

export class EventPool {

    constructor() {
        throw new Error('EventPool is a static class. Do not create instance for this class');
    }

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
                pod.callback(event, eventData, pod);
                if (pod.isBlasted) {
                    // if the current pod is blasted, stop firing the remaining pods in the pool
                    return count;
                }
            }
        }

        return count;
    }

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