require([ 'jquery','owlcarousel'],
	function($){
  $(document).ready(function(){
    $('.plp-slider').owlCarousel({
      loop:true,
      margin:10,
      autoplay:false,
      nav:true,
      dots:false,
      lazyLoad: true,
      lazyLoadEager:10,
      navText : ['<i class="fa fa-angle-left" aria-hidden="true"></i>','<i class="fa fa-angle-right" aria-hidden="true"></i>'],
      responsive:{
        0:{
          items:1
        },
        600:{
          items:4
        },
        1000:{
          items:6
        }
      }
    });
	
    $('.plp-sliders').owlCarousel({
      loop:false,
      margin:10,
      autoplay:false,
      nav:true,
      dots:false,
      lazyLoad: true,
      lazyLoadEager:10,
      navText : ['<i class="fa fa-angle-left" aria-hidden="true"></i>','<i class="fa fa-angle-right" aria-hidden="true"></i>'],
      responsive:{
        0:{
          items:1
        },
        600:{
          items:4
        },
        1000:{
          items:6
        }
      }
    });
  });

  $(window).on('load',function(){
    $('li.klevuProduct .kuProdTop .owl-dots button, .plp-slider .owl-dots button').attr('aria-label','slide-dots');
    $('li.klevuProduct .kuProdTop .owl-dots button span, .plp-slider .owl-dots button span').remove();
    $('.kuDropdown.kuDropSortBy').attr('aria-label','sorting');
    $('.plp-slider .owl-nav .owl-prev').attr('aria-label','prev');
    $('.plp-slider .owl-nav .owl-next').attr('aria-label','next');
  });
	
});
