App = {
	loading: false,
	contracts: {},
	accounts: {
		'0x9af07f42B7504d410982319497d1ad97cEE856F8' : 'Admin',
	},

	load: async () => {
		if(await App.loadWeb3() === false) {
			CharmAlert.getInstance().showAlert('Please allow access to your Ethereum account.', 'error');
			$('#connectButton').closest("div").show();
			$('#content').hide();
			$('#loader').hide();
			return;
		}
		await App.loadAccount()
		await App.loadContract()
		await App.render()
	},

	loadWeb3: async () => {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider
			web3 = new Web3(web3.currentProvider)
			try {
				await ethereum.enable()
			} catch (error) {
				return false;
			}
		} else if (window.ethereum) {
			window.web3 = new Web3(ethereum)
			try {
				await ethereum.enable()
			} catch (error) {
				return false;
			}
		} else if (window.web3) {
			App.web3Provider = web3.currentProvider
			window.web3 = new Web3(web3.currentProvider)
		} else {
			CharmAlert.getInstance().showAlert('Non-Ethereum browser detected. You should consider trying MetaMask!', 'error');
		}
		return true;
	},

	loadAccount: async () => {
		App.account = (await web3.eth.getAccounts())[0];
	},

	loadContract: async () => {
		const todoList = await $.getJSON('TodoList.json')
		App.contracts.TodoList = TruffleContract(todoList)
		App.contracts.TodoList.setProvider(App.web3Provider)
		App.todoList = await App.contracts.TodoList.deployed({ gas: 3000000 });
	},

	render: async () => {
		if (App.loading) return
		App.setLoading(true)

		// $('#account').html(App.account)
		const accountName = App.accounts[App.account] ? App.accounts[App.account] : "AutomaticRaspberry";
		$('#account').html(accountName)

		await App.renderTasks()
		CharmAlert.getInstance().showAlert('Connected to blockchain successfully!', 'success');
		App.setLoading(false)
	},

	renderTasks: async () => {
		const taskCount = await App.todoList.todoCount();
		const $taskList = $('#taskList');
		const $completedTaskList = $('#completedTaskList');

		$('#newTask').val('');
		$taskList.html('');
		$completedTaskList.html('');

		for (var i = 1; i <= taskCount; i++) {
			const task = await App.todoList.tasks(i);
			const taskId = task[0].toNumber();
			const taskContent = task[1];
			const taskCompleted = task[2];

			if(taskContent.length === 0) {
				continue;
			}

			const $newTaskTemplate = $(`
				<li class="list-group-item d-flex justify-content-between align-items-center">
					<label>
						<input type="checkbox" name="${taskId}" ${taskCompleted ? 'checked' : ''}/>
						<span class="content">${taskContent}</span>
					</label>
					<div class="task-actions">
						<button class="btn btn-sm btn-primary edit-btn" data-id="${taskId}"><i class="fas fa-edit"></i></button>
						<button class="btn btn-sm btn-danger delete-btn" data-id="${taskId}"><i class="fas fa-trash-alt"></i></button>
					</div>
				</li>
			`);

			if (taskCompleted) {
				$completedTaskList.append($newTaskTemplate);
			} else {
				$taskList.append($newTaskTemplate);
			}

			$newTaskTemplate.show();
		}
	},

	createTask: async (content) => {
		App.setLoading(true)
		await App.todoList.addTask(content, { from: App.account, gas: 300000 });
		CharmAlert.getInstance().showAlert('Task added successfully!', 'success');
		await App.renderTasks();
		App.setLoading(false);
	},

	updateTask: async (id, content) => {
		App.setLoading(true)
		await App.todoList.updateTask(id, content, { from: App.account, gas: 300000 });
		CharmAlert.getInstance().showAlert('Task Updated successfully!', 'success');
		await App.renderTasks();
		App.setLoading(false);
	},

	deleteTask: async (id) => {
		App.setLoading(true)
		await App.todoList.removeTask(id, { from: App.account, gas: 300000 });
		CharmAlert.getInstance().showAlert('Task Deleted successfully!', 'success');
		await App.renderTasks();
		App.setLoading(false);
	},

	toggleCompleted: async (taskId) => {
		App.setLoading(true)
		await App.todoList.toggleCompleted(taskId, { from: App.account, gas: 300000 });
		await App.renderTasks();
		App.setLoading(false);
	},

	setLoading: (boolean) => {
		App.loading = boolean
		const loader = $('#loader')
		const content = $('#content')
		if (boolean) {
			loader.show()
			content.hide()
		} else {
			loader.hide()
			content.show()
		}
	}
}

// Event delegation
$(() => {
	const $wrapper = $('.todo-list-contents-wrapper');
	const $taskListWrapper = $('#taskList, #completedTaskList');

	$(window).on('load', async () => {
		
		const connectBtn = $('#connectButton');
		connectBtn.on('click', async () => {
			connectBtn.closest("div").hide();
			await App.load();
			window.location.reload();
			$wrapper.show();
		});

		if(window?.ethereum) {
			const accounts = await ethereum.request({ method: 'eth_accounts' })
			App.loading = true;
			if(accounts.length === 0) {
				connectBtn.closest("div").show();
				$wrapper.hide();
				$('#loader').hide();
				CharmAlert.getInstance().showAlert('Please connect to MetaMask.', 'error');
				return;
			}else{
				connectBtn.closest("div").hide();
				App.load();
				$wrapper.show();
			}
			App.loading = false;
		}
	});

	// Task form submission
	$wrapper.on('submit', 'form', async (e) => {
		e.preventDefault();
		const content = $(e.target).find('#newTask').val();
		if (content) {
			await App.createTask(content);
		}
	});

	// Toggle completed checkbox
	$taskListWrapper.on('change', 'input[type="checkbox"]', async (e) => {
		const taskId = e.target.name;
		await App.toggleCompleted(taskId);
	});

	// Edit button click
	$taskListWrapper.on('click', '.edit-btn', (e) => {
		const taskId = $(e.currentTarget).data('id');
		// const newValue = prompt('Enter new value for task:', $(e.currentTarget).closest('li').find('.content').text());
		// if (newValue !== null) {
		// 	App.updateTask(taskId, newValue);
		// 	console.log(`Task ${taskId} saved with new value: ${newValue}`);
		// 	// Here you would call smart contract update function if needed
		// }
		$('#editTaskSaveBtn').data('id', taskId);
		$('#editTaskInput').val($(e.currentTarget).closest('li').find('.content').text());
		$('#editTaskModal').modal('show');
	});

	$(document).on('click', '.editTaskSaveBtn', (e) => {
		const taskId = $(e.currentTarget).data('id');
		const newValue = $('#editTaskInput').val();
		if (newValue !== null) {
			App.updateTask(taskId, newValue);
			console.log(`Task ${taskId} saved with new value: ${newValue}`);
		}
		$('#editTaskModal').modal('hide');
	});

	// Delete button click
	$taskListWrapper.on('click', '.delete-btn', (e) => {
		const taskId = $(e.currentTarget).data('id');
		if (confirm('Are you sure you want to delete this task?')) {
			App.deleteTask(taskId);
			console.log(`Task ${taskId} deleted`);
			// Here you would call smart contract delete function if needed
		}

	});
});
