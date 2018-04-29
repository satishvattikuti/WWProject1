 function initMap() {
        var uluru = {lat:41.65391899999999, lng: -83.62426740000001};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: uluru
        });
        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
 }