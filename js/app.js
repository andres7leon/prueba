/**
 * @author Jhonatan Andres Leon Torres <a7-andres@hotmail.com>
 */
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
        mv.dataCharacters;
        mv.randomComics = false;
        mv.arrayCharacters = [];
        mv.arrayFavorites = [];
        mv.paginationArray = [];
        mv.arrayPagination = [[]];
        mv.countComicsRandom = 1;
        mv.arrayRandomComics = [];
        mv.arraySearchs = [];

        mv.characterSearch = '';

        mv.selectSort = '';
        mv.selectView = '';

        /*
            Limpia el modal que se abre cuando se pide ver mas
        */

        var clearModal = function (){
	    	mv.modalTitle = 'Title'; 
	       	mv.modalImg = './images/imagen2.png';
	       	mv.idModal = 0;
	       	mv.modalDescription = 'Description';
	       	$("#btn-add-mv").removeClass('height-100');
        };

        /*
            agrega estilo al primer boton de la paginacion
        */
        
        var addSelectPage = function(){
        	setTimeout(function(){
        		$('.btns-pages button:nth-child(1)').addClass('btn-pages-select')
        	},1000)
        };

        /*
            Llama api rest de marvel y busca el personaje ingresado, tambien realiza validaciones de campos
        */
       
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

                    	if(mv.arraySearchs.findIndex(i => i === mv.characterSearch) === -1){
                    		mv.randomComics = true;
        				}else{
        					mv.randomComics = false;        					
        				}

		            	localStorage.dataMarvel = JSON.stringify(mv.dataCharacters);
                   		mv.orderView();
                   		addSelectPage();
                    }

                }, function myError(result) {

                    $("#loading").hide();
                    var notification = alertify.notify('Error, please try later ', 'error', 5, function(){});

		        });

        	}else{

	           	var notification = alertify.notify('Please enter a character to search', 'error', 7, function(){});

        	}

        };

        /*
            Llama api rest de marvel para buscar comics asociados al id del personaje seleccionado en ver mas, luego abre el modal con la respuesta.
        */

        mv.modalView = function(id) {

        	clearModal();

        	$("#loading").show();

        	$http({
	            method: "GET",
	            url: urlMV +'characters/'+ id + '/comics' + apikey + '&limit=1',
	        }).then(function mySuccess(result) {

        		$("#loading").hide();
	            var result = result.data;
	            var dataModal = result.data.results[0];

	           	if(dataModal !== undefined){

		           	mv.modalTitle = dataModal.title;
		           	mv.modalImg =  dataModal.thumbnail.path +'.'+dataModal.thumbnail.extension;
		           	mv.idModal = dataModal.id;
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

        };

        /*
            agrega a lista de favoritos desde el modal de ver mas
         */

        mv.addFavorites = function() {
 			
            $("#btn-add-mv").addClass('height-100');
            mv.arrayFavorites.push({id:mv.idModal,title:mv.modalTitle,img:mv.modalImg});
            mv.updateFavoritesLocal();
        };

        /*
            elimina de lista de favoritos desde el modal ver mas
         */

        mv.removeFavorites = function() {
            $("#btn-add-mv").removeClass('height-100');
            var positionDelete = mv.arrayFavorites.findIndex(i => i.id === mv.idModal);
            mv.arrayFavorites.splice(positionDelete,1)
            mv.updateFavoritesLocal();
        };

        /*
            elimina de lista de favoritos por medio del boton eliminar de la lista
         */

        mv.deleteFavorite = function(id){
        	var positionDelete2 = mv.arrayFavorites.findIndex(i => i.id === id);
        	mv.arrayFavorites.splice(positionDelete2,1)
        	mv.updateFavoritesLocal();
        };

        /*
            actualizar los favoritos en el localStorage
         */

        mv.updateFavoritesLocal = function(){
        	localStorage.favoritesMarvel = JSON.stringify(mv.arrayFavorites);
        };

        /*
            ordena y divide los resultados de los personajes, tambien agrega la paginacion
         */

        mv.orderView = function(){

        	if(mv.selectView !== ''){

	        	mv.paginationArray = [];
	        	mv.arrayPagination = [[]];
	        	var numPagination = Math.ceil(mv.dataCharacters.length/parseInt(mv.selectView));
	                    	
	        	for (var i = 1; i <= numPagination ; i++) {
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

	    		mv.arrayCharacters = mv.arrayPagination[1];

        	}
        };

        /*
            actualiza la lista de personajes encontrados dependiendo aa los filtros seleccionados
         */

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

        /*
            navega por medio de la pagianacion muestra el contenido dividido con anterioridad
         */

        mv.changePagination = function(page,$event){

            $('.btns-pages button').removeClass('btn-pages-select');
            $(event.target).addClass('btn-pages-select');
            mv.arrayCharacters = mv.arrayPagination[page];                

        };

        /*
            limpia, valida y ejecuta las funciones necesarias para hacer traer los comics aleatorios en base a los personajes ya buscados
         */

        mv.addRandomComics = function(){

        	$("#loading").show();
        	mv.arraySearchs.push(mv.characterSearch);
        	mv.countComicsRandom = 1;
        	mv.arrayRandomComics = [];
        	for(var i in mv.dataCharacters){
				mv.searchComics(mv.dataCharacters[i].id);
        	}

        };

        /*
            llama api rest de marvel para buscar comics aleatorios en base a los personajes
         */
        
        mv.searchComics = function(id){

        	$http({
	            method: "GET",
	            url: urlMV +'characters/'+ id + '/comics' + apikey + '&limit=3',
	        }).then(function mySuccess(result) {
	            
	            var result = result.data;

	            for(var i in result.data.results){
	            	mv.arrayRandomComics.push(result.data.results[i]);
	            }

	            mv.countComicsRandom++;

	            if(mv.countComicsRandom === mv.dataCharacters.length){
	            	mv.addFavoritesRandom();
	            }

	        }, function myError(result) {

        		$("#loading").hide();
	           	var notification = alertify.notify('Error, please try later ', 'error', 5, function(){});

	        });
        };

        /*
            valida las respuestas obtenidas en la llamada previa y agrega a la lista de favoritos
         */

        mv.addFavoritesRandom = function(){

        	var aComics = mv.arrayRandomComics;

        	if(aComics.length === 0){
        		var notification = alertify.notify('No results found', 'error', 5, function(){});
        	}else{

        		aComics.sort(function(a,b){
				  // Turn your strings into dates, and then subtract them
				  // to get a value that is either negative, positive, or zero.
				  return new Date(b.modified) - new Date(a.modified);
				});


        		if(mv.arrayFavorites.findIndex(k => k.id === aComics[0].id) === -1){
    				mv.arrayFavorites.push({id:aComics[0].id,title:aComics[0].title,img:aComics[0].thumbnail.path+'.'+aComics[0].thumbnail.extension});
    			}

    			var aux = aComics.length-1;

    			if(mv.arrayFavorites.findIndex(k => k.id === aComics[aux].id) === -1){
    				mv.arrayFavorites.push({id:aComics[aux].id,title:aComics[aux].title,img:aComics[aux].thumbnail.path+'.'+aComics[aux].thumbnail.extension});
    			}

    			if(mv.arrayFavorites.findIndex(k => k.id === aComics[1].id) === -1){
    				mv.arrayFavorites.push({id:aComics[1].id,title:aComics[1].title,img:aComics[1].thumbnail.path+'.'+aComics[1].thumbnail.extension});
    			}

    			mv.randomComics = false;

        		mv.updateFavoritesLocal()
        	}

        	$("#loading").hide();
        };

        /*
            se utiliza como construcor del aplicativo
         */

        mv.main = function() {

        	if(localStorage.dataMarvel !== undefined){
        		mv.dataCharacters = JSON.parse(localStorage.dataMarvel);
        		mv.selectView = '10';
        		mv.orderView()
        		addSelectPage();
        	}

        	if(localStorage.favoritesMarvel !== undefined){
        		mv.arrayFavorites = JSON.parse(localStorage.favoritesMarvel);
        	}

        	clearModal();

        };

        mv.main();

    });

})();