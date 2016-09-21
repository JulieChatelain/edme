app.controller('menuCtrl', function ($scope, $log, $state, $window) {
	
    if(!$window.localStorage.token){
    	$scope.loggedIn = false;
    }else{
    	$scope.loggedIn = true;
    }
    
});