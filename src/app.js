App = {
	loading: true,
	contracts: {},
	accounts: {
		'0x9af07f42B7504d410982319497d1ad97cEE856F8' : 'Admin',
	},

	load: async () => {
		App.setLoading(true)
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
		
		if (window.ethereum) {
			window.web3 = new Web3(ethereum)
			App.web3Provider = ethereum
			try {
				// await ethereum.enable()
				// ethereum.send('eth_requestAccounts')
				await ethereum.request({ method: 'eth_requestAccounts' }).catch(() => { return false; });
				// show content  
				$('aside').show();
				$('#content').show();
				App.setLoading(false)
			} catch (error) {
				return false;
			}
		} else if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider
			web3 = new Web3(web3.currentProvider)
			try {
				await ethereum.enable().catch(() => { return false; });
				
				$('aside').show();
				$('#content').show();
				App.setLoading(false)
			} catch (error) {
				return false;
			}

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
		try {
			App.todoList = await App.contracts.TodoList.deployed();
			App.setLoading(false)
			console.log('TodoList deployed at', App.todoList.address);
		} catch (err) {
			CharmAlert.getInstance().showAlert('TodoList contract not found on the connected network. Please switch network to the one you deployed to.', 'error');
			console.error('Contract deployment lookup failed:', err);
			throw err;
		}
	},

	render: async () => {
		if (App.loading) return

		const accountName = App.accounts[App.account] ? App.accounts[App.account] : "AutomaticRaspberry";
		$('#account').html(accountName)

		await App.renderTasks()
		CharmAlert.getInstance().showAlert('Connected to blockchain successfully!', 'success');

		App.setLoading(false)
	},

	renderTasks: async () => {
		// use explicit .call() for view methods to ensure eth_call
		try {
			const taskCountRaw = await App.todoList.todoCount.call({
				gas: 300000
			});
			const taskCount = (taskCountRaw.toNumber) ? taskCountRaw.toNumber() : Number(taskCountRaw);
			const $taskList = $('#taskList');
			const $completedTaskList = $('#completedTaskList');

			$('#newTask').val('');
			$taskList.html('');
			$completedTaskList.html('');

			let total = 0, active = 0, completed = 0;

			for (var i = 1; i <= taskCount; i++) {
				const task = await App.todoList.tasks.call(i);
				const taskId = task[0].toNumber();
				const taskContent = task[1];
				const taskCompleted = task[2];

				if(!taskContent || taskContent.length === 0) continue;

				total++;
				if (taskCompleted) completed++; else active++;

				const $newTaskTemplate = $(
					`<li class="task-item" data-id="${taskId}">
						<label class="flex items-center w-full">
							<input type="checkbox" name="${taskId}" ${taskCompleted ? 'checked' : ''} />
							<span class="content">${taskContent}</span>
						</label>
						<div class="task-actions flex items-center gap-2">
							<button class="edit-btn text-indigo-600" data-id="${taskId}"><i class="fas fa-edit"></i></button>
							<button class="delete-btn text-red-600" data-id="${taskId}"><i class="fas fa-trash-alt"></i></button>
						</div>
					</li>`
				);

				if (taskCompleted) {
					$completedTaskList.append($newTaskTemplate);
				} else {
					$taskList.append($newTaskTemplate);
				}
			}

			// update counters on dashboard
			$('#totalCount').text(total);
			$('#activeCount').text(active);
			$('#completedCount').text(completed);
		}catch (err) {
			CharmAlert.getInstance().showAlert('Error loading tasks from blockchain. Maybe you are out of gas!', 'error');
			// loading false just show error in main 
			App.setLoading(false);
			document.querySelector(".app-root").innerHTML = `
				<div class="text-center text-red-600 h-svh flex flex-col justify-center items-center">
					<p class="text-lg font-semibold">Error loading tasks from blockchain.</p>
					<p class="mt-2">Maybe you are out of gas!</p>
				</div>
			`;
			console.error('Error loading tasks:', err);
			return;
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
	const $wrapper = $('#content');
	const $taskListWrapper = $('#taskList, #completedTaskList');

	$(window).on('load', async () => {
		
		const connectBtn = $('#connectButton');
		// hide loader 
		$('#loader').hide();
		connectBtn.on('click', async () => {
			connectBtn.closest("div").hide();
			await App.load();
			// window.location.reload();
			connectBtn.closest("div").hide();
			// $wrapper.show();
		});

		if(window?.ethereum) {
			const accounts = await ethereum.request({ method: 'eth_accounts' });
			// App.loading = true;
			// App.setLoading(true);
			// hide loader 
			$('#loader').hide();
			// hide connect button if already connected

			if(accounts.length === 0) {
				$('aside').hide();
				connectBtn.closest("div").show();
				$wrapper.hide();
				CharmAlert.getInstance().showAlert('Please connect to MetaMask.', 'error');
				return;
			}else{
				connectBtn.closest("div").hide();
				// show aside menu 
				App.load();
				$('aside').show();
				$wrapper.show();
			}
			// App.loading = false;
			App.setLoading(false);
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
		$('#editTaskSaveBtn').data('id', taskId);
		$('#editTaskInput').val($(e.currentTarget).closest('li').find('.content').text());
		$('#editTaskModal').removeClass('hidden');
	});

	// Save edited task
	$(document).on('click', '#editTaskSaveBtn', (e) => {
		const taskId = $(e.currentTarget).data('id');
		const newValue = $('#editTaskInput').val();
		if (newValue !== null && newValue.length > 0) {
			App.updateTask(taskId, newValue);
			console.log(`Task ${taskId} saved with new value: ${newValue}`);
		}
		$('#editTaskModal').addClass('hidden');
	});

	// Close modal
	$(document).on('click', '#editTaskModalCloseBtn', (e) => {
		$('#editTaskModal').addClass('hidden');
	});

	// Delete button click
	$taskListWrapper.on('click', '.delete-btn', (e) => {
		const taskId = $(e.currentTarget).data('id');
		if (confirm('Are you sure you want to delete this task?')) {
			App.deleteTask(taskId);
			console.log(`Task ${taskId} deleted`);
		}

	});
});
