/*
 * app module
 *
 */
(function() {
     "use strict";

    var app = angular.module('marvelApp', []);
	
	app.controller('appController', function($scope, $http) {
	    
		var mv = this;


		mv.arrayCharacters = [1,2,3,4,5]


		mv.main = function(){
			
		}

		mv.main();

	});

})();
