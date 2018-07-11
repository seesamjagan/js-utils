const _taskid_ = Symbol('_taskid_');

/**
 * 1. all the task should override "start()" method
 * 2. all the task should call "onFinished(isCancelled=false)" method once the task is done!
 * 3. all the task should be headless (means NO UI needed for the user to interact with)
 */
export class JSTask {

    constructor(name = null, { isCancellable = false, description = "" } = {}) {

        if (!name) {
            throw new Error('Error: Task should have a valid name');
        }

        this[_taskid_] = Date.now();

        this.name = name;
        this.description = description;
        this.isCancellable = isCancellable;

        this.isStarted = false;
        this.isRunning = false;
        this.isFinished = false;
        this.isCancelled = false;

        /**
         * start method will start the task
         */
        Object.defineProperty(this, "start", {
            value: () => {
                if(!this.isStarted) {
                    this.isStarted = true;
                    this.isRunning = this.onStart();
    
                    // if the task is started,
                    // notify the task runner about task started
                    // a method which is supplied by the task runner
                    this.isRunning && this.__onTaskStart__ && this.__onTaskStart__();
                }
                return this.isRunning;
            },
            writable: false
        });

        /**
         * cancel() method will cancel the RUNNING task if it is cancellable.
         */
        Object.defineProperty(this, "cancel", {
            value: () => {
                if (this.isCancellable && !this.isCancelled) {
                    // callback for resource cleanup by the task
                    this.isCancelled = this.onCancel();
                    // if cancelled, then complete the task.
                    this.isCancelled && this.complete();
                }
                return this.isCancelled;
            },
            writable: false
        });

        /**
         * pause() method will pause a "RUNNING" task.
         * this method will not have any effect if the task is not started and not running.
         * 
         * @returns {bool} returns true if the task is paused or else return false.
         */
        Object.defineProperty(this, "pause", {
            value: () => {
                if (this.isStarted && this.isRunning) {
                    // ask the task if it can be paused.
                    this.isRunning = !this.onPause();

                    // if the task is paused
                    // notify to the task runner
                    // a method which is supplied by the task runner
                    !this.isRunning && this.__onTaskPasue__ && this.__onTaskPasue__(this);
                }
                return this.isRunning;
            },
            writable: false
        });

        /**
         * resume() method will trigger the pasued task to run again.
         * this method will not have any effect if the task is not yet started.
         * @return {bool} will return true if the task is resumed or else will return false.
         */
        Object.defineProperty(this, "resume", {
            value: () => {

                // we cannot "resume" a task which is running or cancelled
                // we can resume a task only when it is started and NOT running and NOT cancelled
                if (this.isStarted && !this.isRunning && !this.isCancelled) {

                    // ask the task if it can resume.
                    this.isRunning = this.onResume();
        
                    // if the task is resumed,
                    // notify the task runner about task resume
                    // a method which is supplied by the task runner
                    this.isRunning && this.__onTaskResume__ && this.__onTaskResume__(this);
                }
                return this.isRunning;
            },
            writable: false
        });

        /**
         * all task should call this method when the task is completed.
         */
        Object.defineProperty(this, "complete", {
            value: () => {
                this.isRunning = false;
                this.isFinished = true;
        
                // notify the task runner about the completion of the task
                // a method which is supplied by the task runner
                this.__onTaskComplete__ && this.__onTaskComplete__(this);        
            },
            writable: false
        });
    }

    get taskId() {
        return this[_taskid_];
    }

    get status() {
        if(this.isFinished) {
            if(this.isCancelled) {
                return 'cancelled';
            } else {
                return 'completed';
            }
        } 
        if(this.isStarted) {
            if(this.isRunning) {
                return 'running';
            } else {
                return 'paused';
            }
        }
        return 'queued';
    }

    /**
     * start() is the method which will execuited when the task is initiated.
     * all the task should overide this method. 
     * NOTE: user should NOT call this method. it will be called by the task runner.
     * 
     * @returns {bool} should return true if the task started successfully or else it should return false.
     */
    onStart() {
        throw new Error(`Should override the "onStart()" method for the task ${this.name}`);
    }

    /**
     * if the task is cancellable,
     * onCancel() method will be called when the user cancel the task.
     * derived class should override this method.
     * all the "resource clean up" work should be done here!
     * @return {bool} should return true if the task is successfully cancelled or else it should return false.
     */
    onCancel() {
        throw new Error('Sub class of JSTask should override the "onCancel()" method');
    }

    /**
     * onPause() method will be called when the user pause the task.
     * derived class should override this method
     * all the "resource clean/free up" work should be done here!
     * @returns {bool} onPause() method should return true is the task is paused or else it should return false.
     */
    onPause() {
        throw new Error('Sub class of JSTask should override the "onPause()" method');
    }

    /**
     * onResume() method will be called when the user resume a paused task.
     * it has to be overriden by the derived class.
     * @return {bool} it should return true if the task is resumed. or else it should return false.
     */
    onResume() {
        throw new Error('Sub class of JSTask should override the "onResume()" method');
    }
}

let jsTaskRunnerInstance = null;

export class JSTaskManager {

    constructor(onChange=null) {
        if (jsTaskRunnerInstance) {

            if(onChange && jsTaskRunnerInstance.onChangeHandlers.indexOf(onChange) === -1) {
                jsTaskRunnerInstance.onChangeHandlers.push(onChange);
            }

            return jsTaskRunnerInstance;
        }
        jsTaskRunnerInstance = this;
        // will have the list of task in the queue
        this.activeQueue = [];
        // task status change notification callback map
        this.taskChangeCallbackMap = {};
        // task manager's task change notification callback list
        this.onChangeHandlers = [];
        if(onChange) {
            this.onChangeHandlers.push(onChange);
        }
    }

    watchTask(task, onChange=null, autoStart=false) {
        // start the stak is the task is not started.
        task.__onTaskStart__ = this.onTaskStart;
        task.__onTaskPasue__ = this.onTaskPause;
        task.__onTaskResume__ = this.onTaskResume;
        task.__onTaskComplete__ = this.onTaskComplete;

        if(onChange !== null && typeof onChange === "function") {
            this.taskChangeCallbackMap[task.taskId] = onChange;
        }

        autoStart && !task.isStarted && task.start();

        this.activeQueue.push(task);

        this.notifyChange(null);
    }

    onTaskStart = (task) => {
        this.notifyChange(task);
    }
    onTaskPause = (task) => {
        this.notifyChange(task);
    }
    onTaskResume = (task) => {
        this.notifyChange(task);
    }
    onTaskComplete = (task) => {
        this.notifyChange(task);
    }

    notifyChange(task=null) {
        if(task && this.taskChangeCallbackMap.hasOwnProperty(task.taskId)) {
            this.taskChangeCallbackMap[task.taskId](task);
        }
        //this.onChange && this.onChange(task);
        this.onChangeHandlers.forEach(onChange=>onChange(task));
    }

    unwatchTask(task) {
        // TODO :: 
    }

    discardOnChangeHandler(onChange) {
        let index = this.onChangeHandlers.indexOf(onChange);
        if(index >= 0) {
            this.onChangeHandlers.splice(index, 1);
        }
    }

}

export default {
    JSTaskManager,
    JSTask
}; 