require(['jquery'], function ($) {
	$(document).ready(function () {
		$('.footer-left h3').click(function () {
			$('.footer-left h3').removeClass('open-links');
			$(this).addClass('open-links');
		});
		var collheight1 = $("#product-info-ipad").height();
		var collheight2 = $("#product-info2-ipad").height();
		var collheight3 = $("#product-info").height();
		var collheight4 = $("#product-info2").height();

		var padingbottom1 = collheight1 - collheight2;
		var padingbottom2 = collheight3 - collheight4;

		$("#product-info2-ipad").css("margin-top", padingbottom1);
		$("#product-info2").css("top", "41.5%");


		$('.icon-basic-magnifier').click(function () {
			$('#search').focus();
		});


		$('.attributes-accordeon .holder .data').hide();

	
		$(document).on("click",".attributes-accordeon .holder .label", function (e) {
			if ($(this).parent().hasClass('open')) {
				$(this).next('.data').slideUp();
				$(this).parent().removeClass('open');
			} else {
				$('.attributes-accordeon .holder .data').slideUp();
				$('.attributes-accordeon .holder').removeClass('open');
				$(this).parent().addClass('open');
				$(this).next().slideDown();
			}
		});

		$('*').on('show.bs.dropdown show.bs.collapse', function (e) {
			$(e.target).addClass('bs-prototype-override');
		});
		$('*').on('hidden.bs.collapse', function (e) {
			$(e.target).removeClass('bs-prototype-override');
		});
		/******* Wishlist PDP page ***/

		var copy = $(".split-button.split-button-created.light.clickable");

		setTimeout(function () {
			$(".cart-wrap").removeAttr('role');
			$(".cart-wrap #block-shipping").remove();

		}, 5000);
	});

	/****menu_cusotm_toggle*****/
	$('.custom-items li.dropdown').click(function () {
		$(this).toggleClass('open');
	});


	$(window).scroll(function () {
		if ($(this).scrollTop() > 100) {
			$('#back-to-top').addClass("show");
		} else {
			$('#back-to-top').removeClass("show");
		}
	});

	$("#back-to-top").click(function () {
		$("html, body").animate({scrollTop: 0}, 700);
		return false;
	});




	$('nav > ul > li > a').on("click", collapsible);

	function  collapsible(e) {
		if (window.matchMedia('(max-width: 992px)').matches || $(window).width() < 1366) {
			if ($(this).hasClass('hasdrop-down')) {
				e.preventDefault();
			}
			if ($(this).hasClass('plus-sign')) {
				if ($('nav > ul > li > a').hasClass('minus-sign')) {
					$('nav > ul > li > .hasdrop-down').removeClass('minus-sign').addClass('plus-sign');
					$("li > .mega-menu-wrap").removeClass('custom-slide-down').addClass("custom-slide-up");
				}
				$(this).removeClass('plus-sign').addClass('minus-sign');
				$(this).parent().find('.mega-menu-wrap').removeClass('custom-slide-up').addClass("custom-slide-down");
			} else if ($('nav > ul > li > a').hasClass('minus-sign')) {
				$('nav > ul > li > .hasdrop-down').removeClass('minus-sign').addClass('plus-sign');
				$('li > .mega-menu-wrap').removeClass('custom-slide-down').addClass("custom-slide-up");
			} else {
				$('nav > ul > li > a.hasdrop-down').removeClass('minus-sign').addClass('plus-sign');
				$('li > .mega-menu-wrap').removeClass('custom-slide-down').addClass("custom-slide-up");
			}
		}else{
			e.stopPropagation();
		}
	}

	$('.menu-toggle').on('click',function() {
		if (window.matchMedia('(max-width: 992px)').matches) {
			$('nav > ul > li > .hasdrop-down').removeClass('minus-sign').addClass('plus-sign');
			$('li > .mega-menu-wrap').removeClass('custom-slide-down').addClass("custom-slide-up");

			$("nav").toggleClass("show-menu");
			$(".fa-bars, .fa-close").toggleClass("fa-bars fa-close");
		}
	});
	$('.search-toggle').click(function() {
    // Retrieve data from local storage
    var klevuDataString = window.localStorage.getItem('klv_mage');
    var klevuDataObject = klevuDataString ? JSON.parse(klevuDataString) : {};
    var customerData = klevuDataObject['customerData'] || {};

    // Check if customer data is available or if the show URL is not 'no'
    var arteriorsDataString = window.localStorage.getItem('arteriors_mage');
    var arteriorsDataObject = arteriorsDataString ? JSON.parse(arteriorsDataString) : {};
    var arteriorsCustomerData = arteriorsDataObject['ArtCustomerData'] || {};
    var showUrl = arteriorsCustomerData['show_url'];

    if (typeof customerData['customer_group_id'] !== "undefined" || showUrl !== 'no') {
        // Toggle search functionality based on customer group or show URL
        $(this).toggleClass('dark-search');
        $('.search-wrap').toggleClass('show-search');
        if ($(this).hasClass('dark-search')) {
            $(this).text("Cancel");
            $(".show-search .search_focus_toggle").focus();
        } else {
            $(this).text("Search");
        }
    } else {
        // Handle the case where customer data is not available
        $(this).toggleClass('dark-search');
        $('.search-wrap').toggleClass('show-search');
        if ($(this).hasClass('dark-search')) {
            $(this).text("Cancel");
            $('.search-wrap #search_mini_form').hide();
            $('.search-wrap').append("<p class='restricted-search'>Please log in to access this content</p>");
        } else {
            $(this).text("Search");
            $(".restricted-search").remove();
        }
    }
});
	$('.search-toggle').click(function() {
		$(".nav-main > .nav-menu").toggle();
	});

	$(window).scroll(function(){
		var sticky = $('.nav-main'),
			scroll = $(window).scrollTop();

		if (scroll >= 100) sticky.addClass('fixed');
		else sticky.removeClass('fixed');
	});


	$(document).ready(function () {

		setTimeout(function () {
			var mobilewidth = $(window).width();
			if (mobilewidth <= 768) {
				$('link[rel=stylesheet][href*="styles-l"]').remove();
			}
		}, 1000);



	});

	$(document).ready(function () {
		$(".mobile-menu-inner .has-dropdown a").on("click", function () {
			$(this).parentsUntil('menu-content').scrollTop(0);
		})
	});

});



