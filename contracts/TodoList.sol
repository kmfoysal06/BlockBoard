// SPDX-License-Identifier: MIT 
pragma solidity ^0.5.16;

contract TodoList {

    struct Task {
        uint id;
        string title;
        bool done;
    }

    uint public todoCount = 0;
    mapping(uint => Task) public tasks;
     constructor() public {
        // addTask("Create a AI With HTML CSS JS");
     }

     function addTask(string memory _title) public {
        todoCount++;
        tasks[todoCount] = Task(todoCount, _title, false);
     }

     function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.done = !_task.done;
        tasks[_id] = _task;
     }

     function removeTask(uint _id) public {
        delete tasks[_id];
     }

     function getTask(uint _id) public view returns (uint, string memory, bool) {
        Task memory task = tasks[_id];
        return (task.id, task.title, task.done);
     }

     function updateTask(uint _id, string memory _title) public {
        Task memory _task = tasks[_id];
        _task.title = _title;
        tasks[_id] = _task;
     }


}