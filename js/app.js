/*
 * app module
 *
 */
(function() {
    "use strict";

    var app = angular.module('marvelApp', []);

    app.controller('appController', function($scope, $http) {

        var mv = this;

        var urlMV = "https://gateway.marvel.com/v1/public/";
        var apikey = "?apikey=90bf7bba941d17613251e878105fc07a&ts=9&hash=3046f4f71f1df1f644121158538b8ca5";

        //var urlMV = "characters/1011054/comics?limit=1&apikey=90bf7bba941d17613251e878105fc07a&ts=9&hash=3046f4f71f1df1f644121158538b8ca5"

        mv.arrayCharacters = [];
        mv.arrayFavorites = [];

        mv.characterSearch = '';

        mv.selectSort = '';
        mv.selectView = '';

        function clearModal(){
	    	mv.modalTitle = 'Title'; 
	       	mv.modalImg = './images/imagen2.png';
	       	mv.idModal = 0;
	       	mv.modalDescription = 'Description';
	       	$("#btn-add-mv").removeClass('height-100');
        }

        mv.searchCharacters = function(){

        	if(mv.characterSearch !== ""){

        		mv.selectSort = (mv.selectSort === '') ? mv.selectSort = 'name' : mv.selectSort;
        		mv.selectView = (mv.selectView === '') ? mv.selectView = '10' : mv.selectView;

		        $http({
		            method: "GET",
		            url: urlMV +'characters'+ apikey + '&nameStartsWith=' + mv.characterSearch + '&orderBy=' + mv.selectSort + '&limit=100' ,
		        }).then(function mySuccess(result) {

		            var result = result.data;
		           	console.log("result",result);
		           	mv.arrayCharacters = result.data.results;

		        }, function myError(result) {

		           	alert("error en el aplicativo")

		        });

        	}else{

        		alert("porfavor ingrese un personaje")

        	}

        };



        mv.modalView = function(id) {

        	clearModal();

        	$http({
	            method: "GET",
	            url: urlMV +'characters/'+ id + '/comics' + apikey + '&limit=1',
	        }).then(function mySuccess(result) {

	            var result = result.data;
	            var dataModal = result.data.results[0]
	           	console.log("dataModal",dataModal);

	           	mv.modalTitle = dataModal.title;
	           	mv.modalImg =  dataModal.thumbnail.path +'.'+dataModal.thumbnail.extension;
	           	mv.idModal = dataModal.id;
	           	mv.modalDescription = dataModal.description;
            	$("#modalMore").modal();

            	if(mv.arrayFavorites.findIndex(i => i.id === mv.idModal) !== -1){
	            	$("#btn-add-mv").addClass('height-100');
	 			}


	        }, function myError(result) {

	           	alert("error en el aplicativo")

	        });

            console.log("id comic",id);

        };


        mv.addFavorites = function() {
 			
            $("#btn-add-mv").addClass('height-100');
            mv.arrayFavorites.push({id:mv.idModal,title:mv.modalTitle,img:mv.modalImg});

        }

        mv.removeFavorites = function() {
            $("#btn-add-mv").removeClass('height-100');
            var positionDelete = mv.arrayFavorites.findIndex(i => i.id === mv.idModal);
            mv.arrayFavorites.splice(positionDelete,1)
        }

        mv.deleteFavorite = function(id){
        	var positionDelete2 = mv.arrayFavorites.findIndex(i => i.id === id);
        	mv.arrayFavorites.splice(positionDelete2,1)
        };


        mv.main = function() {
        	clearModal();
        };

        mv.main();

    });

})();