import { JSTask, JSTaskManager } from './js-task-manager';

class MyTask extends JSTask {

    duration = 10000; // 10 sec

    interval = 1000; // 1 sec

    values = [];

    intervalID = 0;

    get isCancellable() {
        return true;
    }

    onStart() {
        this.statTimer();
        return true;
    }

    onPause() {
        this.stopTimer();
        return true;
    }

    onResume() {
        this.statTimer();
        return true;
    }

    onCancel() {
        this.stopTimer();
        return true;
    }

    collectData = () => {
        this.values.push(Math.random());
        this.duration -= this.interval;
        if(this.duration <= 0) {
            this.stopTimer();
            this.finish();
        }
    }

    statTimer = () => {
        this.intervalID = setInterval(this.collectData, this.interval);
    }

    stopTimer = () => clearInterval(this.intervalID);

    finish = () => {
        console.log(`${this.name} got completed`);
        this.complete();
    };
}

beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000; // 20 sec
});

describe('JSTask should work as expect', () => {

    it('new JSTask() without task name should throw error', () => {
        expect(()=>new JSTask()).toThrow('Error: Task should have a name');
    });

    it('new JSTask().start() should throw error for onStart() override', ()=>{
        const NAME = 'StartMe';
        expect(new JSTask(NAME).start).toThrow('Should override the "onStart()" method for the task '+NAME);
    });

    it('new JSTask() should have its default config values', () => {
        let task = new JSTask('new task');
        expect(task.isCancellable).toBe(false);
        expect(task.description).toBe("");
        expect(task.taskId).toBeDefined();
    });

    it('task.start() method should start the task and get completed', (done) => {
        let task = new MyTask('my complted task');
        task.duration = 3000;
        task.__onTaskComplete__ = (task) => {
            expect(task.values.length).toBeGreaterThan(2);
            expect(task.isRunning).toEqual(false);
            expect(task.isFinished).toEqual(true);
            expect(task.isCancelled).toEqual(false);
            done();
        }
        task.start();
        expect(task.isStarted).toEqual(true);
        expect(task.isRunning).toEqual(true);
        expect(task.isFinished).toEqual(false);
    });

    it('cancelled task should get cancelled', (done) => {
        let task = new MyTask('my cancelled task', {isCancellable: true});
        task.duration = 3000;
        task.__onTaskComplete__ = (task) => {
            expect(task.isRunning).toEqual(false);
            expect(task.isFinished).toEqual(true);
            expect(task.isCancelled).toEqual(true);
            done();
        }
        task.start();
        task.cancel();
    });

    it('task.start() method should invoke onStart() method', () => {
        let task = new MyTask('my task', {isCancellable: true});
        let val = task.start();
        task.cancel();
        expect(val).toEqual(true);
    });
});

describe('JSTaskManaget should work as expected', () => {
    it('new JSTaskManaget should always create only one instance of it', () => {
        let r1 = new JSTaskManager();
        r1.x = "r1";
        let r2 = new JSTaskManager();
        r2.x = "r2";
        expect(r1).toEqual(r2);
        expect(r1.x).toEqual(r2.x);
    });
});