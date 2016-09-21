
app.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/login');

	$stateProvider

	.state('login', {
		url : '/login',
		views : {

			'' : {
				templateUrl : 'dashboard.html'
			},

			'menu@login' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			},

			'contents@login' : {
				templateUrl : 'partial-login.html',
				controller : 'loginCtrl'
			}
		}
	})
	
	.state('register', {
		url : '/register',
		views : {

			'' : {
				templateUrl : 'dashboard.html'
			},

			'menu@register' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			},

			'contents@register' : {
				templateUrl : 'partial-register.html',
				controller : 'loginCtrl'
			}
		}
	})
	.state('dashboard', {
		url : '/dashboard',
		views : {

			'' : {
				templateUrl : 'dashboard.html'
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