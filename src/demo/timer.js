import React from 'react';
import { JSTask, JSTaskManager } from './../js-task-manager';

import "./timer.css";

class TimerTask extends JSTask {

    constructor(onUpdate=null) {
        super('Timer Task');
        this.time = 0;
        this.onUpdate = onUpdate;
    }

    interval = 999; // ~1 sec

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
        this.time = 0;
        return true;
    }

    statTimer = () => {
        this.intervalID = setInterval(this.update, this.interval);
    }

    stopTimer = () => clearInterval(this.intervalID);

    
    update = () => {
        this.time += 1000;
        this.onUpdate && this.onUpdate(this);
        //this.complete()
    }
}


export class TimerView extends React.Component {

    constructor(props) {
        super(props);
        this.task = new TimerTask(this.onUpdate);
        this.state = {time: 0};
        this.manager = new JSTaskManager();
        this.manager.watchTask(this.task, this.onUpdate);
    }

    onUpdate = ({time}) => {
        this.setState({time})
    }

    onStartStop = () => {
        if(this.task.isStarted) {
            this.task.cancel();
        } else {
            this.task.start();
        }
    }

    onPauseResume = () => {
        if(this.task.isRunning) {
            this.task.pause();
        } else {
            this.task.resume();
        }
    }

    render() {
        const { time } = this.state;
        const { isStarted, isRunning } = this.task;
        return <div className="timer-view">
            <div><label>Time: </label> <span>{parseInt(time/1000, 10)} Seconds</span></div>
            <div>
                <button onClick={this.onStartStop}>{isStarted ? 'Stop' : 'Start'}</button>
                {
                    isStarted && <button onClick={this.onPauseResume}>{isRunning ? 'Pause' : 'Resume'}</button>
                }
            </div>
        </div>
    }
}