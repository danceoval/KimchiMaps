

//FourSquare API
var clientID = "NRSOKR1STVKG4DYTJ33GVDXCHKZJWT33KXEOAVZ3XRTOZKEE";
var clientSecret = "4NAK3FJRWC3R4YOLOHXURALNCYMCJ1MSONB2XDNPUY2Z1VDB";
var NYCLat = 40.7776432;
var NYCLong = -73.9571934;
var NYC = NYCLat + ',' + NYCLong;
var FourSquareURL = "https://api.foursquare.com/v2/venues/search?client_id=" + clientID + "&client_secret=" + clientSecret + "&v=20130815&ll=" + NYC + "&query=kimchi";
var streetPics = $("#pics");
var infoWindow = new google.maps.InfoWindow();
var MAP; 

//https://api.foursquare.com/v2/venues/search?client_id=NRSOKR1STVKG4DYTJ33GVDXCHKZJWT33KXEOAVZ3XRTOZKEE&client_secret=4NAK3FJRWC3R4YOLOHXURALNCYMCJ1MSONB2XDNPUY2Z1VDB&v=20130815&ll=40.7776432,-73.9571934&query=kimchi

//View Model
var ViewModel = function() {
    var self = this;
    self.geolocation = ko.observable();
    var geocoder = new google.maps.Geocoder();
    var newYork = new google.maps.LatLng(40.7776432, -73.9571934);
    self.location = ko.observable('New York');

    //Create observable array of restaurants
    self.restaurantList = ko.observableArray();
    self.markerList = ko.observableArray();
    self.query = ko.observable('');
    self.restaurantNames = ko.observableArray();

    //Set markers for each restaurant in model
    self.setMarkers = function(venue) {
        var lat = venue.location.lat;
        var lng = venue.location.lng;
        var name = venue.name;
        var address = venue.location.formattedAddress[0];
        var checkins = venue.stats.checkinsCount;
        var pos = new google.maps.LatLng(lat,lng);

        var markerOptions = {
            map: MAP,
            position: pos,
            address: address,
            checkins: checkins,
            animation: google.maps.Animation.BOUNCE,
            icon: "img/kimchi.png",
            title: name
        };


        var marker = new google.maps.Marker(markerOptions);
        marker.setAnimation(null);

        google.maps.event.addListener(marker, 'click', function() {

              if (marker.getAnimation() != null) {
                marker.setAnimation(null);
              } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
              }
            });

        google.maps.event.addListener(marker, 'click', function() {
            //console.log("click");
            var content = "<h4>" + marker.title + "</h4><br><p>" + marker.address + "</p><p>Checkins: " + marker.checkins + "</p>";
            var infowindow = new google.maps.InfoWindow({
                content: content
            });

            infowindow.open(MAP,marker);
        });

        //set marker on map
         self.markerList.push(marker);

        var toPush = [markerOptions.title, checkins];
        self.restaurantNames.push(toPush);

    };

    /* May want to create a function that initializes all of your objects and map for easier tracking later on as your program grows */
    //Ajax Request
    $.getJSON(FourSquareURL , function(data) {
        self.restaurantList(data.response.venues);
        self.restaurantList().forEach(function(restaurant) {
            self.setMarkers(restaurant);
        });
    });



    self.search = function(value) {

        //Remove Markers from map and list view
        self.markerList().forEach(function(marker){
            marker.setMap(null);
        });
           
        self.restaurantNames.removeAll();

        for(var i = 0; i < self.restaurantList().length; i++){

            var qName = self.restaurantList()[i].name;
            //If part of query string matches marker title add it to map
            if(qName.toLowerCase().indexOf(value.toLowerCase()) >= -0) {
                self.setMarkers(self.restaurantList()[i]);
            //else remove restaurant name from list view      
            } else {
                self.restaurantNames.remove(qName);
            }
        }
    };

    self.query.subscribe(self.search);


    //Initialize Google Map
    self.initialize = function() {
        var mapOptions = {
            center: { lat: 40.748704, lng: -73.988403 },
            zoom: 12,
            draggable: false,
            disableDefaultUI: true
        };
        MAP = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        //google.maps.event.addDomListener(window, 'load', initialize);
        google.maps.event.addDomListener(window, "resize", function() {
            var center = MAP.getCenter();
            google.maps.event.trigger(MAP, "resize");
            MAP.setCenter(center); 
        });
        

    };
    self.initialize();
    //console.log(self.markerList());
};

$(document).ready(function() {

    $("#toggle").click(function(){
        if ($("#toggle").hasClass("active")) {
            $("#toggle").removeClass("active");
            $("#m1").removeClass('active');
        } else {
            $("#toggle").addClass("active");
            $("#m1").addClass('active');
        }
    });



    var vm = new ViewModel();
    ko.applyBindings(vm);
});
