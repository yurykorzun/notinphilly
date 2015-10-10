$(document).ready(function(){

    /*slider*/
    var owlExample = $('#owl-example');
    if($(window).width() > 799) {
        owlExample.owlCarousel({
            autoPlay : false
        });
    }
    owlExample.owlCarousel({
        autoPlay : 5000
    });

    /*hide slider*/
    var hideSliderBtn = $('.hide-slider-btn');
    hideSliderBtn.click(function(){
        owlExample.slideToggle();
        $('.arrow').toggleClass('up');
    });

    /*google map*/
    function initialize() {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
          center: new google.maps.LatLng(39.95, -75.1667),
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
            /*makes map fit to window on the desktop*/
            mapCanvas.style.height = window.innerHeight +'px';

        var map = new google.maps.Map(mapCanvas, mapOptions);
      }
      google.maps.event.addDomListener(window, 'load', initialize);


    /*accordion*/
    $('.accordion').click(function(e){
        $(this).next().slideToggle();
        e.preventDefault();
    });

    /*fancybox*/
    $('.get-started-btn').fancybox({
        maxWidth: 500,
        width: '90%',
        autoHeight: true,
        maxHeight: '92%',
        fitToView: true,
        autoSize: false,
        closeClick: false,
        openEffect: 'none',
        closeBtn: 'true',
        margin: 0,
        scrolling : 'auto',
        helpers: {
              overlay: {
                  locked: true
              }
        },
        beforeShow: function(){
            $('.fancybox-overlay').css({'z-index':'8010'});
        },
        afterClose: function(){
            loadPageRadio();
        }
    });

    var resizeFancy = function() {
        $('.fancybox-inner').height($('#user-auth'));
    };

    /*user-authentication fields*/
    var userNew = $('#user-new');
    var userExisting = $('#user-existing');
    var signupFields = $('#signup-fields');
    var signinFields = $('#signin-fields');
    var forgotPasswordFields = $('#forgot-password-fields');
    var forgotPasswordLink = $('#forgot-password-link');
    var rememberedPasswordLink = $('#remembered-password-link');
    var loadPageRadio = function(){
        signupFields.css('display','block');
        signinFields.css('display','none');
        forgotPasswordFields.css('display','none');
        userNew.prop("checked", true);
        userExisting.prop("checked", false);
    };

    userNew.change(function(){
        loadPageRadio();
    });

    userExisting.change(function(){
        signupFields.slideToggle();
        signinFields.css('display','block');
        forgotPasswordFields.css('display','none');
        resizeFancy();
    });

    forgotPasswordLink.click(function(){
        signinFields.slideToggle();
        forgotPasswordFields.css('display','block');
    });

    rememberedPasswordLink.click(function(){
        signinFields.slideToggle();
        forgotPasswordFields.css('display','none');
    });

});

