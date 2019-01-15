var app = angular.module('myApp', ['ngAnimate']);
app.controller("myCtrl", function($scope, $timeout) {
	$scope.control = false;
	$scope.resultCtrl = true;

	$scope.test = function(){
		$scope.checked = !$scope.checked;
	}


	$scope.clear = function(){
		$scope.name=''
		$scope.resultCtrl = true;
		$scope.favCtrl = false;
		$scope.ctrlDetail = false;
	}
	$scope.back = function(){
		$scope.ctrlDetail = false;
		if ($('.nav-pills .active').text() == 'Favorites')
			$scope.favCtrl = true;
		else
			$scope.resultCtrl = false;	
	}

	$scope.like = function(url,user,id,num){
		switch(num){
			case 0: 
				var strId = '#name' + id;
				break;
			case 1:
				var strId = '#follow' + id;
				break;
		}
		var btn = angular.element(document.querySelector(strId));
		if (localStorage.getItem(id) === null) {
			btn.removeClass("glyphicon-star-empty");
			btn.addClass('glyphicon glyphicon-star').addClass('lighten-star');
			// store item in localStorage
			var value = {url: url, name: user, id: id, type:$('.nav-pills .active').text()};
		    localStorage.setItem(id, JSON.stringify(value));
		    console.log(`${localStorage.getItem(id)}`);			
		}
		else{
			localStorage.removeItem(id);
			btn.removeClass("glyphicon-star");
			btn.removeClass("lighten-star");
			btn.addClass('glyphicon glyphicon-star-empty');

			var list = [],
	        keys = Object.keys(localStorage),
	        i = keys.length;
		    while ( i-- ) {
		    	var tmp = JSON.parse(localStorage.getItem(keys[i]));
		        list.push(tmp);
		    }
			$scope.lists = list;
		}
	}

	$scope.deleteFav = function(id){						
		localStorage.removeItem(id);
		var list = [],
        keys = Object.keys(localStorage),
        i = keys.length;

	    while ( i-- ) {
	    	var tmp = JSON.parse(localStorage.getItem(keys[i]));
	        list.push(tmp);
	    }
		$scope.lists = list;
	}

	$scope.getdetails = function(url,name,id,type){
		$scope.resultCtrl = true;
		$scope.ctrlDetail = true;
		$scope.favCtrl = false;
		$("#bar1").show();
		$("#bar2").show();
		$scope.control = false;
		$timeout(function () {     
		if ($('.nav-pills .active').text() == 'Events' || type == 'Events'){
			$scope.albums = {};
	        $scope.posts = {};
	        $scope.id = id;
	        $scope.user = name;
			$scope.url = url;
			$("#bar1").hide();
			$("#bar2").hide();
			$scope.control = true;		
		}
		else {
			$.ajax({
			    type: "GET",		
			    dataType: "jsonp",
			    url: "http://chloe571-env.us-west-2.elasticbeanstalk.com/index.php",
			    data: { 
			     	type: 'Details',
			        name: id
			    },
			    jsonpCallback: 'detail_callback',
			    error: function(xhr,status,error) {
			        console.log(`${error}`);
			    }
			});
		}	
    }, 1000);
	}

	$scope.checkStorage = function(id){
		if (localStorage.getItem(id) === null) {
			return 0;
		}
		else
			return 1;
	}

	$scope.postFB = function(){
		FB.ui(
		  {
		  	app_id: '480010375722915',
		    method: 'feed',
		    link: window.location.href,
		    picture: $scope.url,
		    name: $scope.user,
		    caption: 'FB SEARCH FROM USC CSCI571',
		  },
		  function(response) {
			    if (response && !response.error_message) {
			      alert('Posted successfully');
			    } else {
			      alert('No Posted');
			    }
			  }
		);

	}
});

var global_response;
var center;

function detail_callback(res){
	// document.write(JSON.stringify(res.albums.data));
	$("#bar1").hide();
	$("#bar2").hide();
	scope = angular.element(document.getElementById('album-panel')).scope()
	if (jQuery.isEmptyObject(res.albums)) {
		scope.$apply(function() {
        scope.albums = {};
        scope.control = true;
   	 	});
	}
	else {
		scope.$apply(function() {
		scope.control = true;
        scope.albums = res.albums.data;
    	});
	}

	scope2 = angular.element(document.getElementById('post-panel')).scope()
	// scope2.control-post = true;
	if (jQuery.isEmptyObject(res.posts)) {
		scope2.$apply(function() {
        scope2.posts = {};
        scope2.id = res.id;
        scope2.user = res.name;
		scope2.url = res.picture.data.url;
   	 	});
	}
	else {
		scope2.$apply(function() {
        scope2.posts = res.posts.data;
        scope2.id = res.id;
        scope2.user = res.name;
		scope2.url = res.picture.data.url;
		scope2.createtime = function(data){
			return moment(data).format("YYYY-MM-DD hh:mm:ss");
			};
		scope2.showMsg = function(value){
			if (!jQuery.isEmptyObject(value.message))
				return value.message;
			else if (!jQuery.isEmptyObject(value.story))
				return value.story;
				else
					return '';
		}
    	});
	}

}

function jsonp_callback(response){
	// document.getElementById("result").innerHTML = JSON.stringify(response);
	global_response = response;
	$("#progressBar").hide();
	$("#result").show();
	$("#pre").hide();
	$("#next").hide();
	$("#both").hide();

	if(!jQuery.isEmptyObject(response.paging)){
		if(!jQuery.isEmptyObject(response.paging.next)){ //exist'next'
		if(!jQuery.isEmptyObject(response.paging.previous)) //exist 'previous'
			$("#both").show();
		else
			$("#next").show();
		} 
		else
			$("#pre").show();
	}
	scope = angular.element(document.getElementById('result')).scope()
	scope.myVar = false
    scope.header =[
      	"#",
        "Profile Photo",
        "Name",
        "Favorite",
        "Details"
    ];
    scope.records = response.data;
 	scope.$digest();

}

$(document).ready(function(){
	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};
	function success(pos) {
	  var crd = pos.coords;
	  console.log('Your current position is:');
	  console.log(`Latitude : ${crd.latitude}`);
	  console.log(`Longitude: ${crd.longitude}`);
	  console.log(`More or less ${crd.accuracy} meters.`);
	  center = crd.latitude+','+crd.longitude;
	};
	function error(err) {
	  console.warn(`ERROR(${err.code}): ${err.message}`);
	};
	navigator.geolocation.getCurrentPosition(success, error, options);


    $("#myForm").submit(function(event){
    		event.preventDefault();
    		if ($('.nav-pills .active').text() != 'Favorites') {
    			$("#progressBar").show();
	    		$("#result").hide();
				$.ajax({
					cache:"false",
			        type: "GET",
			        dataType: "jsonp",
			        url: "http://chloe571-env.us-west-2.elasticbeanstalk.com/index.php",
			        data: { 
			         	type: $('.nav-pills .active').text(),
			            name: $("#keyword").val(),
			            location: center
			        },
			        jsonpCallback: 'jsonp_callback',
			        error: function(xhr,status,error) {
			             console.log(`${error}`);
			        }
	    		});	
	    		scope = angular.element(document.getElementById('result')).scope();
			    scope.resultCtrl = false;
			    scope.$digest();
			    scope2 = angular.element(document.getElementById('slide-detail')).scope();
			    scope2.ctrlDetail = false;
			    scope2.$digest()
    		}
    		else{
    			scope2 = angular.element(document.getElementById('slide-detail')).scope();
				scope2.ctrlDetail = false;
				scope2.$digest();
    			scope = angular.element(document.getElementById('favoriteTable')).scope();
			    scope.favCtrl = true;
			    scope.$digest();
    			$("#progBar").show();
    			setTimeout(function(){$("#progBar").hide();},1000);
    		}
    		
    });

	$("#user, #event, #page, #group, #place").on('click', function(){
		$.ajax({
		    type: "GET",
		    dataType: "jsonp",
		    url: "http://chloe571-env.us-west-2.elasticbeanstalk.com/index.php",
		    data: { 
		     	type: $(this).text(),
		        name: $("#keyword").val(),
		       	location: center
		    },
		    jsonpCallback: 'jsonp_callback',
		    error: function(xhr,status,error) {
		        console.log(`${error}`);
		    }
		});
		scope = angular.element(document.getElementById('result')).scope();
	    scope.resultCtrl = false;
		scope.$digest();
		scope1 = angular.element(document.getElementById('favoriteTable')).scope();
	    scope1.favCtrl = false;
	    scope1.$digest();
	    scope2 = angular.element(document.getElementById('slide-detail')).scope();
	    scope2.ctrlDetail = false;
	    scope2.$digest();
	});

	$("button[value='next']").click(function(){
		$.ajax({
		    type: "GET",
		    dataType: "jsonp",
		    url: global_response.paging.next,
		    jsonpCallback: 'jsonp_callback',
		    error: function(xhr,status,error) {
		    	console.log(`${error}`);
		    }
		});
	});
	$("button[value='previous']").click(function(){
		$.ajax({
		    type: "GET",
		    dataType: "jsonp",
		    url: global_response.paging.previous,
		    jsonpCallback: 'jsonp_callback',
		    error: function(xhr,status,error) {
		    	console.log(`${error}`);
		    }
		});
	});

	$("#favTab").click(function(){
		var list = [],
        keys = Object.keys(localStorage),
        i = keys.length;

	    while ( i-- ) {
	    	var tmp = JSON.parse(localStorage.getItem(keys[i]));
	        list.push(tmp);
	    }
	    scope1 = angular.element(document.getElementById('result')).scope();
	    scope1.resultCtrl = true;
		scope1.$digest();
		scope2 = angular.element(document.getElementById('slide-detail')).scope();
		scope2.ctrlDetail = false;
		scope2.$digest();
	    scope = angular.element(document.getElementById('favoriteTable')).scope();
	    scope.favCtrl = true;
		scope.lists = list;
		scope.favoriteHeader =[
	      	"#",
	        "Profile Photo",
	        "Name",
	        "Type",
	        "Favorite",
	        "Details"
    	];
		scope.$digest();

	});
});


window.fbAsyncInit = function() {
    FB.init({
      appId      : '480010375722915',
      xfbml      : true,
      version    : 'v2.8'
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));