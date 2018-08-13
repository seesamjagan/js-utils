import { EventPool, map, EventPod } from './event-pool';

let order = [];
let cb1 = () => { order.push(1) };
let cb2 = () => { order.push(2) };
let cb3 = () => { order.push(3) };
let cb4 = () => { order.push(4) };
let cbBlastPod = (data, pod) => { pod.blast(); }

beforeEach(() => {
    order.splice(0, order.length);
    EventPool.dropAll();
});

it('should execuit the watch callback\'s based on the default order', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a1', cb2);
    EventPool.fire('a1');
    expect(order.join('')).toBe('12');
});

it('checking the order of firing the pods based on the "order"', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a1', cb2, -1);
    EventPool.watch('a1', cb3);
    EventPool.watch('a1', cb4);
    EventPool.fire('a1');
    expect(order.join('')).toBe('2134');
});

it('checking the dropAll(\'event\') drops all the pods of the given "event"', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a2', cb2);
    EventPool.dropAll('a1');

    expect(map).toMatchObject({ 'a2': [new EventPod('a2', cb2)] });

    EventPool.dropAll('a2');

    expect(map).toMatchObject({});
});

it('checking the dropAll(null) drops all the pods of all the events', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a2', cb2);
    expect(map).toMatchObject({ 'a2': [new EventPod('a2', cb2)], 'a1': [new EventPod('a1', cb1)] });
    EventPool.dropAll();
    expect(map).toMatchObject({});
});

it('check the watch command to drop the duplicate request', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a2', cb2);
    EventPool.watch('a2', cb2);// adding duplicate cb2. which should be dropped by the EventPool
    expect(map).toMatchObject({ 'a2': [new EventPod('a2', cb2)], 'a1': [new EventPod('a1', cb1)] });
});


it('check if blasting a pod stops firing the remaining pods in the pool', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a1', cb2);
    EventPool.watch('a1', cbBlastPod, -1);
    expect(EventPool.fire('a1')).toBe(1);
});

it('check the behavior of the event initiator', () => {
    EventPool.watch('a1', cb1, 0, 'i1');
    EventPool.watch('a1', cb2, 0, 'i2');
    EventPool.watch('a1', cb3, 0, 'i2');
    EventPool.watch('a1', cb4, 0, 'i1');
    EventPool.watch('a1', cb3);
    EventPool.watch('a1', cb4);
    EventPool.fire('a1', null, 'i1');
    expect(order.join('')).toBe('1434');
    EventPool.fire('a1', null, 'i2');
    expect(order.join('')).toBe('14342334');
})

it('checking the unsubsribe () functionality', () => {

    let unsub1 = EventPool.watch('a1', cb1);

    expect(map['a1']).toMatchObject([new EventPod('a1', cb1)]);

    expect(EventPool.fire('a1', null, null)).toBe(1);

    let unsub2 = EventPool.watch('a1', cb2);

    expect(EventPool.fire('a1', null, null)).toBe(2, `should have called 2 call back`);

    expect(EventPool.fire('a3', null, null)).toBe(false, 'no call back should be called');

    // checking the unsubsribe () functionality
    unsub1();
    expect(map['a1']).toMatchObject([new EventPod('a1', cb2)]);
    unsub2();
    expect(map['a1']).toMatchObject([]);

    //expect(new EventPool()).toThrow({});
});

//1. send event , callback as invalid, check returns false
it('checking the invalid event , callback to unwatch(\'event\') Should return false', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a2', cb2);

    // event , callback as invalid
    let watchStatus = EventPool.unwatch('' , cb3 );

    expect(watchStatus).toBeFalsy();
});


//2. send unwatched event, to check returns false
it('checking the unwatched event, callaback to unwatch(\'event\') should return false', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a2', cb2);

    // event , callback as invalid
    let watchStatus = EventPool.unwatch('a3' , cb3 );

    expect(watchStatus).toBeFalsy();
});


//3. send watched event , callback eventpool to unwatch, check returns true
it('checking the watched event, callaback to unwatch(\'event\') should returns true', () => {
    EventPool.watch('a1', cb1);
    EventPool.watch('a2', cb2);

    // event , callback as invalid
    let watchStatus = EventPool.unwatch('a1' , cb1 );

    expect(watchStatus).toBeTruthy();
});


//4. send unwatched initiator, check if it returns false
it('checking the not valid initiator to unwatch(\'event\') should return false', () => {
    EventPool.watch('a1', cb1, 0, "initiator1");
    EventPool.watch('a2', cb2);

    // event , callback as invalid
    let watchStatus = EventPool.unwatch('a1' , cb1 , "notvalidinitiator" );

    expect(watchStatus).toBeFalsy();
});


//5. send event, callback , initiator check if it returns true
it('checking the watched initiator to unwatch(\'event\') should return true', () => {
    EventPool.watch('a1', cb1, 0, "initiator1");
    EventPool.watch('a2', cb2);

    // event , callback as invalid
    let watchStatus = EventPool.unwatch('a1' , cb1 , "initiator1" );

    expect(watchStatus).toBeTruthy();
});

//5. send event, callback , initiator check if it returns true
it('checking the watched initiator to unwatch(\'event\') should return true & object check', () => {
    EventPool.watch('a1', cb1, 0, "initiator1");
    EventPool.watch('a1', cb1);

    // event , callback as valid
    let watchStatus = EventPool.unwatch('a1' , cb1);

    expect(map['a1']).toMatchObject([new EventPod('a1', cb1, 0, "initiator1")]);

});