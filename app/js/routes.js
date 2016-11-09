
app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

	$urlRouterProvider.otherwise('/login');

	$stateProvider

	.state('login', {
		url : '/login',
		views : {

			'' : {
				templateUrl : 'mainView.html'
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
				templateUrl : 'mainView.html'
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
	
	.state('parameters', {
		url : '/parameters',
		views : {

			'' : {
				templateUrl : 'mainView.html'
			},

			'menu@parameters' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			},

			'contents@parameters' : {
				templateUrl : 'partial-parameters.html',
				controller : 'parametersCtrl'
			}
		}
	})
	.state('dashboard', {
		url : '/dashboard',
		views : {

			'' : {
				templateUrl : 'mainView.html'
			},

			'contents@dashboard' : {
				templateUrl : 'partial-dashboard.html',
				controller : 'patientsCtrl'
			},

			'menu@dashboard' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			}
		}

	})
	.state('patients', {
		url : '/patients',
		views : {

			'' : {
				templateUrl : 'mainView.html'
			},

			'contents@patients' : {
				templateUrl : 'partial-patients.html',
				controller : 'patientsCtrl'
			},

			'menu@patients' : {
				templateUrl : 'partial-menu.html',
				controller : 'menuCtrl'
			}
		}

	});
	
	$httpProvider.interceptors.push(['$q', '$log', '$window', function($q, $log, $window) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                if ($window.localStorage.serverToken) {
                	config.headers['x-access-token'] = $window.localStorage.serverToken;
                }
                return config;
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    
                }
                return $q.reject(response);
            }
        };
    }]);



});