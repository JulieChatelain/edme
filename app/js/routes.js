
app.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/login');

	$stateProvider

	// HOME STATES AND NESTED VIEWS
	// ========================================
	.state('login', {
		url : '/login',
		views : {

			'' : {
				templateUrl : 'login.html'
			},

			'menu@login' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			},

			'loginForm@login' : {
				templateUrl : 'partial-login.html',
				controller : 'loginCtrl'
			}
		}
	})

	// ABOUT PAGE AND MULTIPLE NAMED VIEWS
	// =================================
	.state('dashboard', {
		url : '/dashboard',
		views : {

			'' : {
				templateUrl : 'dashboard.html'
			},

			'sidebar@dashboard' : {
				templateUrl : 'partial-sidebar.html',
				controller : 'sidebarCtrl'
			},

			'contents@dashboard' : {
				templateUrl : 'partial-contents.html',
				controller : 'dashboardCtrl'
			},

			'menu@dashboard' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			}
		}

	});

});