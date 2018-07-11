import React from 'react';
import { Timer } from './demo/timer';
import { JSTaskManager } from './js-task-manager';

class TaskManagerView extends React.Component {
    constructor(props) {
        super(props);
        this.manager = new JSTaskManager(this.onChange);
        this.state = {
            activeQueue: [...this.manager.activeQueue]
        }
    }

    onChange = (task) => {
        this.setState({
            activeQueue: [...this.manager.activeQueue]
        });
    }

    render() {
        const { activeQueue } = this.state;
        return (<div>
            <div><span>Task Count: </span><span>{activeQueue.length}</span></div>
            <div>
                {
                    activeQueue.map(task => <div key={task.taskId}><span>{task.name}</span><span> - </span><span>{task.status}</span></div>)
                }
            </div>
        </div>)
    }
}

export default class App extends React.Component {
    render() {
        return (<div>
            <h1>Its React !</h1>
            <Timer />
            <Timer />
            <Timer />
            <TaskManagerView />
        </div>)
    }
}