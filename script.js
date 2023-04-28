const userSelect = document.querySelector('#user-select');
const taskList = document.querySelector('#task-list');
const taskSummary = document.querySelector('#task-summary');
let currentUserId = null;

// fetch list of users from API
fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => response.json())
  .then(users => {
    // populate user select dropdown with options
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });

    // add event listener to user select dropdown
    userSelect.addEventListener('change', () => {
      currentUserId = userSelect.value;
      loadTasks(currentUserId);
    });
  });

function loadTasks(userId) {
  // fetch tasks for user from API
  fetch(`https://jsonplaceholder.typicode.com/users/${userId}/todos`)
    .then(response => response.json())
    .then(tasks => {
      // sort tasks by completed status
      tasks.sort((a, b) => {
        if (a.completed && !b.completed) {
          return 1;
        } else if (!a.completed && b.completed) {
          return -1;
        } else {
          return 0;
        }
      });

      // display tasks in task list
      taskList.innerHTML = '';
      tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.taskId = task.id;
        li.textContent = task.title;
        if (task.completed) {
          li.classList.add('completed');
        } else {
          const markDoneBtn = document.createElement('button');
          markDoneBtn.textContent = 'Mark done';
          markDoneBtn.addEventListener('click', () => {
            // handle mark done button click
            if (!currentUserId) {
              return;
            }
            const taskLi = markDoneBtn.parentElement;
            const taskId = taskLi.dataset.taskId;

            markDoneBtn.textContent = 'Loading...';
            markDoneBtn.disabled = true;

            markTaskDone(taskId, markDoneBtn, taskLi);

          });
          li.appendChild(markDoneBtn);
        }
        taskList.appendChild(li);

        // update task summary
        const numCompleted = tasks.filter(task => task.completed).length;
        const numTotal = tasks.length;
        taskSummary.textContent = `${numCompleted}/${numTotal} tasks completed`;

        
      });
    })
    
}

function markTaskDone(taskId, markDoneBtn, taskLi) {
  fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: true }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => {
      if (response.ok) {
        // update UI after task is marked as done
        taskLi.classList.add('completed');
        taskLi.removeChild(markDoneBtn);

        // update task summary
        const numCompleted = document.querySelectorAll('.completed').length;
        const numTotal = taskList.children.length;
        taskSummary.textContent = `${numCompleted}/${numTotal} tasks completed`;
      } else {
        throw new Error('Unable to mark task as done');
      }
    })
    .catch(error => console.error(error))
    .finally(() => {
      markDoneBtn.disabled = false;
    });
}
