const _taskid_ = Symbol('_taskid_');

/**
 * 1. all the task should override "onStart()" method
 * 2. all the task should call "complete()" method once the task is done!
 * 3. all the task should be headless (means it should NOT have any UI logic / DOM manipulation)
 * 4. all the task should override the method onCancel() if the task is cancellable
 * 5. all the task should override the method onPause() and onResume() if the task can be pausable and resumable.
 * 6. By default all the task is NOT cancellable. derievd class have to override the isCancellable() getter to override to return different value based on case-to-case time-to-time.
 */
export class JSTask {

    static get COMPLETED () {return 'completed'; }
    static get CANCELLED () {return 'cancelled'; }
    static get RUNNING () { return 'running'; }
    static get PAUSED () { return 'paused'; }
    static get QUEUED () { return 'queued'; }

    constructor(name = null, {description = "" } = {}) {

        if (!name) {
            throw new Error('Error: Task should have a name');
        }

        this[_taskid_] = Date.now();

        this.name = name;
        this.description = description;

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

        JSTaskManager.getInstance().watchTask(this);
    }

    get taskId() {
        return this[_taskid_];
    }

    get status() {
        if(this.isFinished) {
            if(this.isCancelled) {
                return JSTask.CANCELLED;
            } else {
                return JSTask.COMPLETED;
            }
        } 
        if(this.isStarted) {
            if(this.isRunning) {
                return JSTask.RUNNING;
            } else {
                return JSTask.PAUSED;
            }
        }
        return JSTask.QUEUED;
    }

    /**
     * derived classes should override this getter to let the outside world know wethere it is cancellable or not.
     */
    get isCancellable() {
        return false;
    }

    /**
     * onStart() is a lifecycle method which will execuited when the task is initiated.
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
     * onCancel() is a lifecycle method will be called when the user cancel the task.
     * derived class should override this method.
     * all the "resource clean up" work should be done here!
     * @return {bool} should return true if the task is successfully cancelled or else it should return false.
     */
    onCancel() {
        throw new Error('Sub class of JSTask should override the "onCancel()" method');
    }

    /**
     * onPause() is a lifecycle method will be called when the user pause the task.
     * derived class should override this method
     * all the "resource clean/free up" work should be done here!
     * @returns {bool} onPause() method should return true is the task is paused or else it should return false.
     */
    onPause() {
        throw new Error('Sub class of JSTask should override the "onPause()" method');
    }

    /**
     * onResume() is a lifecycle method will be called when the user resume a paused task.
     * it has to be overriden by the derived class.
     * @return {bool} it should return true if the task is resumed. or else it should return false.
     */
    onResume() {
        throw new Error('Sub class of JSTask should override the "onResume()" method');
    }
}

let jsTaskRunnerInstance = null;

// holder to store all the task.
const taskList = [];

export class JSTaskManager {

    static getInstance() {
        return jsTaskRunnerInstance || new JSTaskManager();
    }

    constructor(onChange=null) {
        if (jsTaskRunnerInstance) {

            if(onChange && jsTaskRunnerInstance.onChangeHandlers.indexOf(onChange) === -1) {
                jsTaskRunnerInstance.onChangeHandlers.push(onChange);
            }

            return jsTaskRunnerInstance;
        }
        jsTaskRunnerInstance = this;
        
        // task status change notification callback map
        this.taskChangeCallbackMap = {};
        // task manager's task change notification callback list
        this.onChangeHandlers = [];
        if(onChange) {
            this.onChangeHandlers.push(onChange);
        }
    }

    watchTask(task, onChange=null, autoStart=false) {
        

        if(taskList.indexOf(task)>=0) {
            // do NOT register the same task if it is already in the queue
            return;
        } 

        // adding task status notifiers
        task.__onTaskStart__ = this.onTaskStart;
        task.__onTaskPasue__ = this.onTaskPause;
        task.__onTaskResume__ = this.onTaskResume;
        task.__onTaskComplete__ = this.onTaskComplete;

        // adding task specific task change handler
        if(onChange !== null && typeof onChange === "function") {
            this.taskChangeCallbackMap[task.taskId] = onChange;
        }

        // start the task if asked to do so
        autoStart && !task.isStarted && task.start();

        // record the task for manipulation
        taskList.push(task);

        // notify the outside world about the change in the task manager
        this.notifyChange(null);

        return this;
    }

    unwatchTask(task) {
        const index = taskList.indexOf(task);
        if(index>=0) {
            // removing task status notifiers
            task.__onTaskStart__ = null;
            task.__onTaskPasue__ = null;
            task.__onTaskResume__ = null;
            task.__onTaskComplete__ = null;

            // deleting task specific task change handler
            delete this.taskChangeCallbackMap[task.taskId];

            // remove the task from the record.
            taskList.splice(index, 1);

             // notify the outside world about the change in the task manager
            this.notifyChange(null);
        }
        return this;
    }

    get activeQueue() {
        return [...taskList];
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

    /**
     * 
     * @param {JSTask} task 
     */
    notifyChange(task=null) {
        if(task && this.taskChangeCallbackMap.hasOwnProperty(task.taskId)) {
            this.taskChangeCallbackMap[task.taskId](task);
        }
        
        this.onChangeHandlers.forEach(onChange=>onChange(task));
    }

    /**
     * 
     * @param {function} onChange 
     */
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