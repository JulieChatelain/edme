app.controller('dashboardCtrl', function ($scope, $log, $state, $window) {
	
    if(!$window.localStorage.token){
    	$scope.loggedIn = false;
        $state.transitionTo('login');
    }else{
    	$scope.loggedIn = true;
    }
    
});