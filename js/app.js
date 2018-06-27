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
        mv.dataCharacters;
        mv.arrayCharacters = [];
        mv.arrayFavorites = [];
        mv.paginationArray = [];
        mv.arrayPagination = [[]];

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

                $("#loading").show();

        		mv.selectSort = (mv.selectSort === '') ? mv.selectSort = 'name' : mv.selectSort;
        		mv.selectView = (mv.selectView === '') ? mv.selectView = '10' : mv.selectView;

		        $http({
		            method: "GET",
		            url: urlMV +'characters'+ apikey + '&nameStartsWith=' + mv.characterSearch + '&orderBy=' + mv.selectSort + '&limit=100' ,
		        }).then(function mySuccess(result) {

                    $("#loading").hide();

		            mv.dataCharacters = result.data.data.results;


                    if(mv.dataCharacters.length === 0){
                        var notification = alertify.notify('No results found', 'info', 5, function(){});                        
                    }else{
		            	localStorage.dataMarvel = JSON.stringify(mv.dataCharacters);
                   		mv.orderView();
                    }

                }, function myError(result) {

                    $("#loading").hide();
                    var notification = alertify.notify('Error, please try later ', 'error', 5, function(){});

		        });

        	}else{

        		alert("porfavor ingrese un personaje")

        	}

        };

        mv.modalView = function(id) {

        	clearModal();

        	$("#loading").show();

        	$http({
	            method: "GET",
	            url: urlMV +'characters/'+ id + '/comics' + apikey + '&limit=1',
	        }).then(function mySuccess(result) {

        		$("#loading").hide();
	            var result = result.data;
	            var dataModal = result.data.results[0]
	           	console.log("dataModal",dataModal);

	           	if(dataModal !== undefined){

		           	mv.modalTitle = dataModal.title;
		           	mv.modalImg =  dataModal.thumbnail.path +'.'+dataModal.thumbnail.extension;
		           	mv.idModal = dataModal.id;
		           	console.log("dataModal.description",dataModal.description)
		           	mv.modalDescription = dataModal.description;
	            	$("#modalMore").modal();

	            	if(mv.arrayFavorites.findIndex(i => i.id === mv.idModal) !== -1){
		            	$("#btn-add-mv").addClass('height-100');
		 			}

	           	}else{
	           		var notification = alertify.notify('this character does not have comics', 'info', 8, function(){});
	           	}

	        }, function myError(result) {

        		$("#loading").hide();
	           	var notification = alertify.notify('Error, please try later ', 'error', 5, function(){});

	        });

            console.log("id comic",id);

        };

        mv.addFavorites = function() {
 			
            $("#btn-add-mv").addClass('height-100');
            mv.arrayFavorites.push({id:mv.idModal,title:mv.modalTitle,img:mv.modalImg});
            mv.updateFavoritesLocal();
        }

        mv.removeFavorites = function() {
            $("#btn-add-mv").removeClass('height-100');
            var positionDelete = mv.arrayFavorites.findIndex(i => i.id === mv.idModal);
            mv.arrayFavorites.splice(positionDelete,1)
            mv.updateFavoritesLocal();
        }

        mv.deleteFavorite = function(id){
        	var positionDelete2 = mv.arrayFavorites.findIndex(i => i.id === id);
        	mv.arrayFavorites.splice(positionDelete2,1)
        	mv.updateFavoritesLocal();
        };

        mv.updateFavoritesLocal = function(){
        	localStorage.favoritesMarvel = JSON.stringify(mv.arrayFavorites);
        }

        mv.orderView = function(){

        	if(mv.selectView !== ''){

	        	mv.paginationArray = [];
	        	mv.arrayPagination = [[]];
	        	var numPagination = Math.ceil(mv.dataCharacters.length/parseInt(mv.selectView));
	                    	
	        	for (var i = 1; i <= numPagination ; i++) {
	        		console.log("numPagination",i);
	        		mv.paginationArray.push(i);
	        	}

	        	var cont = 0;
	        	var arrayAdd = [];

	        	for(var j in mv.dataCharacters){

	    			cont++;
	    			arrayAdd.push(mv.dataCharacters[j]);

	    			if(cont === parseInt(mv.selectView)){
	    				mv.arrayPagination.push(arrayAdd);
	    				arrayAdd = [];
	    				cont = 0;
	    			}else if((parseInt(j) + 1)  === mv.dataCharacters.length && cont < parseInt(mv.selectView)){
	    				mv.arrayPagination.push(arrayAdd);                    				
	    			}

	    		}

	    		console.log("mv.arrayPagination",mv.arrayPagination)

	    		mv.arrayCharacters = mv.arrayPagination[1];

        	}
        };


        mv.changeSelectOrder = function(){

        	if(mv.selectSort === 'name'){
		    	mv.dataCharacters.sort(function(a,b){
					return a.name.localeCompare(b.name);
				})
				mv.orderView();
        	}else if(mv.selectSort === 'modified'){
	        	mv.dataCharacters.sort(function(a,b){
				  // Turn your strings into dates, and then subtract them
				  // to get a value that is either negative, positive, or zero.
				  return new Date(b.modified) - new Date(a.modified);
				});
				mv.orderView();
        	}

        };

        mv.changePagination = function(page,$event){

            $('.btns-pages button').removeClass('btn-pages-select');
            $(event.target).addClass('btn-pages-select');
            mv.arrayCharacters = mv.arrayPagination[page];                

        };

        mv.main = function() {

        	if(localStorage.dataMarvel !== undefined){
        		mv.dataCharacters = JSON.parse(localStorage.dataMarvel);
        		mv.selectView = '10';
        		console.log("mv.dataCharacters",mv.dataCharacters)
        		mv.orderView()
        	}

        	if(localStorage.favoritesMarvel !== undefined){
        		mv.arrayFavorites = JSON.parse(localStorage.favoritesMarvel);
        	}

        	clearModal();
        	
        };

        mv.main();

    });

})();