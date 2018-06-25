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

		mv.modalView = function(){

			alert("siii");

		};


		mv.addFavorites = function(){
			$("#btn-add-mv").toggleClass('height-100');
		}

		mv.removeFavorites = function(){
			$("#btn-add-mv").toggleClass('height-100');
		}


		mv.main = function(){
			
		};

		mv.main();

	});

})();
