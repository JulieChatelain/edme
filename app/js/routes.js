
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
		},
        access: { requiredAuthentication: false }
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
		},
        access: { requiredAuthentication: false }
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
		},
        access: { requiredAuthentication: true }
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
		},
        access: { requiredAuthentication: true }

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
		},
        access: { requiredAuthentication: true }

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



}).run(function ($rootScope, $location, $state, $log, $window, $injector, DBService) {
    $rootScope.$on("$stateChangeStart", function (event, nextState, currentRoute) {
        $rootScope.rootAlerts = [];
        //$log.debug(" state: " + JSON.stringify(nextState));
        // Get user account
        if($window.localStorage.token){
        	$rootScope.loggedIn = true;
        	$rootScope.userId = $window.localStorage.token;
    		DBService.findUserById($rootScope.userId, function(err, user){
    			if(err || !user){
    				$log.debug("Erreur lors du chargement des données utilisateurs.");
    			}else{
    				$rootScope.user = user;	
    			}			
    		});
        }
        
        if (nextState !== null && nextState.access !== null && nextState.access.requiredAuthentication && !$window.localStorage.token) {
            $log.debug("redirect...");
        	$location.path("/login");
        }
    });
});