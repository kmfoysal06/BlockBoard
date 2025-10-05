/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ (function() {

eval("{App = {\n  loading: true,\n  contracts: {},\n  accounts: {\n    '0x9af07f42B7504d410982319497d1ad97cEE856F8': 'Admin'\n  },\n  load: async () => {\n    App.setLoading(true);\n    if ((await App.loadWeb3()) === false) {\n      CharmAlert.getInstance().showAlert('Please allow access to your Ethereum account.', 'error');\n      $('#connectButton').closest(\"div\").show();\n      $('#content').hide();\n      $('#loader').hide();\n      return;\n    }\n    await App.loadAccount();\n    await App.loadContract();\n    await App.render();\n  },\n  loadWeb3: async () => {\n    if (window.ethereum) {\n      window.web3 = new Web3(ethereum);\n      App.web3Provider = ethereum;\n      try {\n        // await ethereum.enable()\n        // ethereum.send('eth_requestAccounts')\n        await ethereum.request({\n          method: 'eth_requestAccounts'\n        }).catch(() => {\n          return false;\n        });\n        // show content  \n        $('aside').show();\n        $('#content').show();\n        App.setLoading(false);\n      } catch (error) {\n        return false;\n      }\n    } else if (typeof web3 !== 'undefined') {\n      App.web3Provider = web3.currentProvider;\n      web3 = new Web3(web3.currentProvider);\n      try {\n        await ethereum.enable().catch(() => {\n          return false;\n        });\n        $('aside').show();\n        $('#content').show();\n        App.setLoading(false);\n      } catch (error) {\n        return false;\n      }\n    } else {\n      CharmAlert.getInstance().showAlert('Non-Ethereum browser detected. You should consider trying MetaMask!', 'error');\n    }\n    return true;\n  },\n  loadAccount: async () => {\n    App.account = (await web3.eth.getAccounts())[0];\n  },\n  loadContract: async () => {\n    const todoList = await $.getJSON('TodoList.json');\n    App.contracts.TodoList = TruffleContract(todoList);\n    App.contracts.TodoList.setProvider(App.web3Provider);\n    // App.todoList = \n    // App.todoList = await App.contracts.TodoList.at(deployedAddress);\n    try {\n      App.todoList = await App.contracts.TodoList.deployed();\n      App.setLoading(false);\n      console.log('TodoList deployed at', App.todoList.address);\n    } catch (err) {\n      CharmAlert.getInstance().showAlert('TodoList contract not found on the connected network. Please switch network to the one you deployed to.', 'error');\n      console.error('Contract deployment lookup failed:', err);\n      throw err;\n    }\n  },\n  render: async () => {\n    if (App.loading) return;\n    const accountName = App.accounts[App.account] ? App.accounts[App.account] : \"AutomaticRaspberry\";\n    $('#account').html(accountName);\n    await App.renderTasks();\n    CharmAlert.getInstance().showAlert('Connected to blockchain successfully!', 'success');\n    App.setLoading(false);\n  },\n  renderTasks: async () => {\n    // use explicit .call() for view methods to ensure eth_call\n    try {\n      const taskCountRaw = await App.todoList.todoCount.call({\n        gas: 300000\n      });\n      const taskCount = taskCountRaw.toNumber ? taskCountRaw.toNumber() : Number(taskCountRaw);\n      const $taskList = $('#taskList');\n      const $completedTaskList = $('#completedTaskList');\n      $('#newTask').val('');\n      $taskList.html('');\n      $completedTaskList.html('');\n      let total = 0,\n        active = 0,\n        completed = 0;\n      for (var i = 1; i <= taskCount; i++) {\n        const task = await App.todoList.tasks.call(i);\n        const taskId = task[0].toNumber();\n        const taskContent = task[1];\n        const taskCompleted = task[2];\n        if (!taskContent || taskContent.length === 0) continue;\n        total++;\n        if (taskCompleted) completed++;else active++;\n        const $newTaskTemplate = $(`<li class=\"task-item\" data-id=\"${taskId}\">\n\t\t\t\t\t\t<label class=\"flex items-center w-full\">\n\t\t\t\t\t\t\t<input type=\"checkbox\" name=\"${taskId}\" ${taskCompleted ? 'checked' : ''} />\n\t\t\t\t\t\t\t<span class=\"content\">${taskContent}</span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t\t<div class=\"task-actions flex items-center gap-2\">\n\t\t\t\t\t\t\t<button class=\"edit-btn text-indigo-600\" data-id=\"${taskId}\"><i class=\"fas fa-edit\"></i></button>\n\t\t\t\t\t\t\t<button class=\"delete-btn text-red-600\" data-id=\"${taskId}\"><i class=\"fas fa-trash-alt\"></i></button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</li>`);\n        if (taskCompleted) {\n          $completedTaskList.append($newTaskTemplate);\n        } else {\n          $taskList.append($newTaskTemplate);\n        }\n      }\n\n      // update counters on dashboard\n      $('#totalCount').text(total);\n      $('#activeCount').text(active);\n      $('#completedCount').text(completed);\n    } catch (err) {\n      CharmAlert.getInstance().showAlert('Error loading tasks from blockchain. Maybe you are out of gas!', 'error');\n      // loading false just show error in main \n      App.setLoading(false);\n      document.querySelector(\".app-root\").innerHTML = `\n\t\t\t\t<div class=\"text-center text-red-600 h-svh flex flex-col justify-center items-center\">\n\t\t\t\t\t<p class=\"text-lg font-semibold\">Error loading tasks from blockchain.</p>\n\t\t\t\t\t<p class=\"mt-2\">Maybe you are out of gas!</p>\n\t\t\t\t</div>\n\t\t\t`;\n      console.error('Error loading tasks:', err);\n      return;\n    }\n  },\n  createTask: async content => {\n    App.setLoading(true);\n    await App.todoList.addTask(content, {\n      from: App.account,\n      gas: 300000\n    });\n    CharmAlert.getInstance().showAlert('Task added successfully!', 'success');\n    await App.renderTasks();\n    App.setLoading(false);\n  },\n  updateTask: async (id, content) => {\n    App.setLoading(true);\n    await App.todoList.updateTask(id, content, {\n      from: App.account,\n      gas: 300000\n    });\n    CharmAlert.getInstance().showAlert('Task Updated successfully!', 'success');\n    await App.renderTasks();\n    App.setLoading(false);\n  },\n  deleteTask: async id => {\n    App.setLoading(true);\n    await App.todoList.removeTask(id, {\n      from: App.account,\n      gas: 300000\n    });\n    CharmAlert.getInstance().showAlert('Task Deleted successfully!', 'success');\n    await App.renderTasks();\n    App.setLoading(false);\n  },\n  toggleCompleted: async taskId => {\n    App.setLoading(true);\n    await App.todoList.toggleCompleted(taskId, {\n      from: App.account,\n      gas: 300000\n    });\n    await App.renderTasks();\n    App.setLoading(false);\n  },\n  setLoading: boolean => {\n    App.loading = boolean;\n    const loader = $('#loader');\n    const content = $('#content');\n    if (boolean) {\n      loader.show();\n      content.hide();\n    } else {\n      loader.hide();\n      content.show();\n    }\n  }\n};\n\n// Event delegation\n$(() => {\n  const $wrapper = $('#content');\n  const $taskListWrapper = $('#taskList, #completedTaskList');\n  $(window).on('load', async () => {\n    const connectBtn = $('#connectButton');\n    // hide loader \n    $('#loader').hide();\n    connectBtn.on('click', async () => {\n      connectBtn.closest(\"div\").hide();\n      await App.load();\n      // window.location.reload();\n      connectBtn.closest(\"div\").hide();\n      // $wrapper.show();\n    });\n    if (window?.ethereum) {\n      const accounts = await ethereum.request({\n        method: 'eth_accounts'\n      });\n      // App.loading = true;\n      // App.setLoading(true);\n      // hide loader \n      $('#loader').hide();\n      // hide connect button if already connected\n\n      if (accounts.length === 0) {\n        $('aside').hide();\n        connectBtn.closest(\"div\").show();\n        $wrapper.hide();\n        CharmAlert.getInstance().showAlert('Please connect to MetaMask.', 'error');\n        return;\n      } else {\n        connectBtn.closest(\"div\").hide();\n        // show aside menu \n        App.load();\n        $('aside').show();\n        $wrapper.show();\n      }\n      // App.loading = false;\n      App.setLoading(false);\n    }\n  });\n\n  // Task form submission\n  $wrapper.on('submit', 'form', async e => {\n    e.preventDefault();\n    const content = $(e.target).find('#newTask').val();\n    if (content) {\n      await App.createTask(content);\n    }\n  });\n\n  // Toggle completed checkbox\n  $taskListWrapper.on('change', 'input[type=\"checkbox\"]', async e => {\n    const taskId = e.target.name;\n    await App.toggleCompleted(taskId);\n  });\n\n  // Edit button click\n  $taskListWrapper.on('click', '.edit-btn', e => {\n    const taskId = $(e.currentTarget).data('id');\n    $('#editTaskSaveBtn').data('id', taskId);\n    $('#editTaskInput').val($(e.currentTarget).closest('li').find('.content').text());\n    $('#editTaskModal').removeClass('hidden');\n  });\n\n  // Save edited task\n  $(document).on('click', '#editTaskSaveBtn', e => {\n    const taskId = $(e.currentTarget).data('id');\n    const newValue = $('#editTaskInput').val();\n    if (newValue !== null && newValue.length > 0) {\n      App.updateTask(taskId, newValue);\n      console.log(`Task ${taskId} saved with new value: ${newValue}`);\n    }\n    $('#editTaskModal').addClass('hidden');\n  });\n\n  // Close modal\n  $(document).on('click', '#editTaskModalCloseBtn', e => {\n    $('#editTaskModal').addClass('hidden');\n  });\n\n  // Instructions modal handlers\n  $(document).on('click', '#menu-instructions', e => {\n    $('#instructionsModal').removeClass('hidden');\n  });\n  $(document).on('click', '#instructionsModalCloseBtn, #instructionsModalCloseBtn2', e => {\n    $('#instructionsModal').addClass('hidden');\n  });\n\n  // Close instructions modal when clicking outside\n  $(document).on('click', '#instructionsModal', e => {\n    if (e.target.id === 'instructionsModal') {\n      $('#instructionsModal').addClass('hidden');\n    }\n  });\n\n  // Delete button click\n  $taskListWrapper.on('click', '.delete-btn', e => {\n    const taskId = $(e.currentTarget).data('id');\n    if (confirm('Are you sure you want to delete this task?')) {\n      App.deleteTask(taskId);\n      console.log(`Task ${taskId} deleted`);\n    }\n  });\n});\n\n//# sourceURL=webpack://charming-portfolio-plugin/./src/app.js?\n}");

/***/ }),

/***/ "./src/ca.js":
/*!*******************!*\
  !*** ./src/ca.js ***!
  \*******************/
/***/ (function() {

eval("{class CharmAlert {\n  constructor() {\n    this.timeout = null;\n  }\n  static getInstance() {\n    if (!this.instance) {\n      this.instance = new CharmAlert();\n    }\n    return this.instance;\n  }\n  showAlert(message, type = 'info') {\n    const alertBox = document.createElement('div');\n    alertBox.className = `charm-alert charm-alert-${type}`;\n    alertBox.style.position = 'fixed';\n    // Calculate stacked top position: find existing alerts and place new one below them\n    const existingAlerts = Array.from(document.querySelectorAll('.charm-alert'));\n    const gap = 10; // px gap between alerts\n    let topOffset = 50; // base top offset\n    if (existingAlerts.length > 0) {\n      // compute the bottom-most point among existing alerts\n      const bottoms = existingAlerts.map(a => {\n        const rect = a.getBoundingClientRect();\n        return rect.top + rect.height;\n      });\n      const maxBottom = Math.max(...bottoms);\n      // if maxBottom is greater than base offset, start after it plus gap\n      topOffset = Math.max(topOffset, Math.ceil(maxBottom + gap));\n    }\n    alertBox.style.top = topOffset + 'px';\n    // zindex \n    alertBox.style.zIndex = '1111';\n    alertBox.style.left = '50%';\n    alertBox.style.transform = 'translateX(-50%)';\n    alertBox.style.padding = '10px 20px';\n    alertBox.style.borderRadius = '5px';\n    alertBox.style.color = '#fff';\n    alertBox.style.fontSize = '16px';\n    alertBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';\n    alertBox.style.backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : type === 'warning' ? '#FF9800' : '#2196F3';\n    alertBox.style.transition = 'opacity 0.3s ease-in-out';\n    alertBox.style.opacity = '0.9';\n    alertBox.style.cursor = 'pointer';\n    alertBox.innerText = message;\n    // pause timeout on hover and resume on mouse leave\n    // Append the alert box to the body\n    document.body.appendChild(alertBox);\n\n    // Use a per-alert timeout so multiple alerts don't clash\n    let alertTimeout = null;\n    const startAutoRemove = () => {\n      alertTimeout = setTimeout(() => {\n        alertBox.remove();\n      }, 3000);\n    };\n\n    // pause timeout on hover and resume on mouse leave\n    alertBox.addEventListener('mouseenter', () => {\n      if (alertTimeout) {\n        clearTimeout(alertTimeout);\n        alertTimeout = null;\n      }\n    });\n    alertBox.addEventListener('mouseleave', () => {\n      // restart timer\n      if (!alertTimeout) startAutoRemove();\n    });\n\n    // clicking removes immediately\n    alertBox.addEventListener('click', () => {\n      if (alertTimeout) clearTimeout(alertTimeout);\n      alertBox.remove();\n    });\n\n    // start the auto removal timer\n    startAutoRemove();\n  }\n}\n\n//# sourceURL=webpack://charming-portfolio-plugin/./src/ca.js?\n}");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   logo: function() { return /* reexport default export from named module */ _logo_png__WEBPACK_IMPORTED_MODULE_3__; }\n/* harmony export */ });\n/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ \"./src/style.css\");\n/* harmony import */ var _ca_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ca.js */ \"./src/ca.js\");\n/* harmony import */ var _ca_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ca_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _app_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.js */ \"./src/app.js\");\n/* harmony import */ var _app_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_app_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _logo_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./logo.png */ \"./src/logo.png\");\n\n\n\n\n// Import logo so webpack emits it and updates references in HTML via html-loader\n\n\n// The original HTML uses <span id=\"account\"> to show account; keep App on window\nif (typeof window !== 'undefined') {\n  window.App = window.App || {};\n}\n\n// export for potential tests\n\n\n//# sourceURL=webpack://charming-portfolio-plugin/./src/index.js?\n}");

/***/ }),

/***/ "./src/logo.png":
/*!**********************!*\
  !*** ./src/logo.png ***!
  \**********************/
/***/ (function(module) {

"use strict";
eval("{module.exports = \"data:image/png;base64,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\";\n\n//# sourceURL=webpack://charming-portfolio-plugin/./src/logo.png?\n}");

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://charming-portfolio-plugin/./src/style.css?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;