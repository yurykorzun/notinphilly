(function () {
  angular.module('notinphillyServerApp')
    .controller('InstagramCarouselController', [ '$scope', '$http', function($scope, $http) {
      var endPoint = "https://api.instagram.com/v1/users/self/media/recent?access_token=2241873445.3f58e21.737195cc588e4c43a05c3588a3bb3001&callback=JSON_CALLBACK";

      $scope.carousel = {
        interval: 6000,
        slides: []
      };

      var slides = $scope.carousel.slides;
      $http.jsonp(endPoint).success(function(response) {
        var instaSlides = response.data;

        for(var i = 0; i < instaSlides.length; i++)
        {
          var instaSlide = instaSlides[i];
          slides.push({
            image: instaSlide.images.low_resolution.url,
            text: instaSlide.caption.text
          });
        }
      });

    }]);
})();
