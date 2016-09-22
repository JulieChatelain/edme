app.controller('loginCtrl', function ($scope, $log, $state, $window, DBService) {
	$scope.user = {
			login: "",
			password : ""
	};
	$scope.error = "";
	
	$scope.closeError = function(){
		$scope.error = "";
	};
	
	$scope.login = function(){
		if($scope.user.login != '' && $scope.user.password != ''){
			// Find the user in the DB, once found access dashboard
			DBService.findUser($scope.user.login, $scope.user.password, function(err, savedUser){
				
				if(!err){
					if(savedUser){
					 $window.localStorage.token = savedUser._id;
					 $state.transitionTo('dashboard');
					}else{
						$scope.error = "Identifiant ou mot de passe invalide. Veuillez réessayer."
						$scope.$apply(); // async so need to "refresh" the scope.
					}
				}else{
					$scope.error = "Une erreur est survenue, veuillez réessayer. (erreur : " + err + " )";
					$scope.$apply(); // async so need to "refresh" the scope.
				}
				
			});
		}else{
			$scope.error = "Identifiant ou mot de passe invalide. Veuillez réessayer.";
		}
	};
	

	$scope.register = function(){
		if($scope.user.login != '' && $scope.user.password != ''){
			// Create a new user in the DB, once done access dashboard
			DBService.createUser($scope.user.login, $scope.user.password, function(err, savedUser){
				
				if(!err){
					if(savedUser){
					 $window.localStorage.token = savedUser._id;
					 $state.transitionTo('dashboard');
					}else{
						$scope.error = "Une erreur est survenue, veuillez réessayer. (erreur : " + err + " )";
						$scope.$apply(); // async so need to "refresh" the scope.
					}
				}else{
					$scope.error = "Ce nom d'utilisateur est déjà pris.";
					$scope.$apply(); // async so need to "refresh" the scope.
				}
				
			});
		}else{
			$scope.error = "Veuillez remplir tous les champs.";
		}
	};
	
	// If a token exists, redirect to dashboard
    if($window.localStorage.token){
        $state.transitionTo('dashboard');
    }
});