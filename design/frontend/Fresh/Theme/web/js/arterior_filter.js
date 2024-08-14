var ArteriorsHome = ArteriorsHome || {};

ArteriorsHome.catalog = {};

require(['jquery'],function($){
    (function($) {
        $.extend(ArteriorsHome.catalog, {
            /*productList: function(){
                $('ul.category-list h3').matchHeight({
                    property: 'height'
                });

                var maxProductImage = 0,maxProductBottom= 0;
                $("ul.products-grid li.item .product-image, ul.products-grid li.item .product-bottom").removeAttr("style");


                maxProductImage = Math.max.apply(Math, $("ul.products-grid li.item .product-image img").map(function(){
                    return $(this).outerHeight();
                }));
                $("ul.products-grid li.item .product-image").css("height",maxProductImage);

                maxProductBottom = Math.max.apply(Math, $("ul.products-grid li.item .product-bottom").map(function(){
                    return $(this).outerHeight();
                }));

                $("ul.products-grid li.item .product-bottom").css("height",maxProductBottom);
            },*/
            catagoryListFilter : function(){
                $("#toolbar-layered-navigation .block-title, #category-layered-navigation .block-title").insertAfter(".toolbar .pager");
                $("#category-layered-navigation").insertAfter(".toolbar-top > .toolbar");
                
                if($(".toolbar-top > .toolbar > a").length <= 0) {
                    //$(".amshopby-filters-left .block-content dl dt:contains(Stock)").insertAfter(".toolbar .pager");
                    $(".am-filter-items-stock a").first().clone().insertBefore(".toolbar-top > .toolbar .sorter");
                    $(".toolbar-top > .toolbar > a").attr("id","stock_filter_a");
                    var txt = $("a#stock_filter_a span.label").first().text();
                    $("a#stock_filter_a span.label").remove();
                    $("a#stock_filter_a span.count").remove();
                    $("a#stock_filter_a").html(txt);
                    $("a#stock_filter_a").addClass("in-stock-filter");
                }
                if($(".amshopby-filters-left > .block-content > .filter-actions").length > 0) {
                    $(".amshopby-filters-left > .block-content > .filter-actions").addClass("actions");
                    $(".amshopby-filters-left > .block-content > .actions").removeClass("filter-actions");
                    $(".amshopby-filters-left > .block-content > .actions > a").addClass("reset-link");
                    $(".amshopby-filters-left > .block-content > .actions > a").html("Reset Filter");
                    $(".amshopby-filters-left > .block-content > .actions").insertAfter("a#stock_filter_a");
                }
                
                $("#toolbar-layered-navigation, #category-layered-navigation").hide();
                $("#category-layered-navigation").addClass('popup-open');
                
                $(".toolbar .block-title").click(function () {
                    $(this).toggleClass("active");
                    $("#toolbar-layered-navigation, #category-layered-navigation").slideToggle(function () {
                        $(this).toggleClass("show");
                    });
                });
                
                $(".amshopby-filters-left .block-content .actions").insertAfter(".in-stock-filter, .in-stock-upholstery");
                $(".amshopby-filters-left .block-content dl").slice(0,3).wrapAll("<div class='first-filter-container' />");
                $(".amshopby-filters-left .block-content dl").slice(3,6).wrapAll("<div class='slider-container' />");
                $(".amshopby-filters-left .block-content dl").slice(6,9).wrapAll("<div class='third-filter-container' />");
                
                if ($('.block-layered-nav dt.filter-label.damp-rated').next('dd').length > 0) {
                    $('.damp-rated-dd').appendTo('.environment-label');
                    $(".amshopby-filters-left .block-content .third-filter-container dl").slice(0,1).wrapAll("<div class='third-filter-first-container' />");
                    $(".amshopby-filters-left .block-content .third-filter-container dl").slice(1,3).wrapAll("<div class='third-filter-second-container' />");
                }
                

                var attr = $('input[name="amshopby[stock][]"]').attr('checked');
                // For some browsers, `attr` is undefined; for others,
                // `attr` is false.  Check for both.
                if (typeof attr !== typeof undefined && attr !== false) {
                   $(".in-stock-filter").addClass("active");
                }else{
                    $(".in-stock-filter").removeClass("active");
                }


                //instock click trigger
                // if($('input[name="amshopby[stock][]" ).hasClass("checked")==false){
                //     $(".in-stock-filter").removeClass("active");
                
                // else if($("li[data-label='In Stock'] a").hasClass("am_shopby_link_selected")){
                //     $(".in-stock-filter").addClass("active");
                // }
                /*$(".in-stock-filter").click(function(){
                    $("li[data-text='In Stock'] a").trigger("click");
                });*/

                if($(window).width() < 991){
                    $(".amshopby-filters-left .block-content dl dt").click(function(){
                        $(this).toggleClass("openTab").next(".filter-column").slideToggle();
                    });
                }

                $(".amshopby-filters-left").append("<a href='javascript:void(0)' class='close-toggle'></a>");
                $(".close-toggle").click(function(){
                    $(".block-title").trigger('click');
                });
                if($(".product-image").length){
                    /*$(".product-image img.lazy-load").lazyload({
                        threshold : 100,
                        effect : "fadeIn"
                    });*/
                }
            },
            spConfigListDetails : function(){
                /*Event.observe(window, 'load', function() {
                    if ('undefined' != typeof spConfig && spConfig.config.defaultChild) {
                        showProductData(spConfig.config.defaultChildAttr.defaultAttrId[1], spConfig.config.defaultChildAttr.defaultAttrValue[1], 'firstTime');
                        for(var i=0;i<4;i++){
                            var attrId = spConfig.config.defaultChildAttr.defaultAttrId[i];
                            var attrVal = spConfig.config.defaultChildAttr.defaultAttrValue[i];
                            var labelId = 'attribute'+attrId+'_'+attrVal;
                            if($(labelId)){
                                $(labelId).addClass("selected");
                            }
                        }
                    }
                });*/

                function showProductData(attrId, attrValue, whichTime)
                {
                    // Change the data, as per the selected product.
                    changeData(attrId, attrValue);

                    // Get the object of Legend/Size.
                    var firstOptionObj = $('attribute' + attrId);

                    // Var to store the default index number.
                    var defaultIdx = 0;

                    if (spConfig.config.defaultChildAttr.defaultAttrId[2]) {
                        // Store the id of the Color/Legend select box.
                        var secondAttrId = spConfig.config.defaultChildAttr.defaultAttrId[2];
                        //secondAttrId = secondAttrId.replace(/[a-z]*/, '');

                        // Get the object of Color/Legend.
                        var secondOptionObj = $('attribute' + secondAttrId);

                        // Set the value.
                        if (whichTime) {
                            secondOptionObj.value = spConfig.config.defaultChildAttr.defaultAttrValue[2];
                        } else {
                            secondOptionObj.value = secondOptionObj.options[1].value;
                        }

                        // Change the data, as per the selected product.
                        changeData(secondAttrId, secondOptionObj.value);

                        // If next setting is there..
                        if (spConfig.config.defaultChildAttr.defaultAttrId[3]) {
                            // Then create object of next setting and populate the next value.
                            var thirdOptionObj = secondOptionObj.nextSetting;

                            // Store the id of the Chain-Length select box.*/
                            var thirdAttrId = thirdOptionObj.id.replace(/[a-z]*/, '');

                            // Set the value.
                            if (spConfig.config.defaultChildAttr.defaultAttrValue[3]) {
                                thirdOptionObj.value = spConfig.config.defaultChildAttr.defaultAttrValue[3];
                            } else {
                                thirdOptionObj.value = thirdOptionObj.options[1].value;
                            }

                            // Change the data, as per the selected product.
                            changeData(thirdAttrId, thirdOptionObj.value);
                        }

                        // If next setting is there..
                        if (spConfig.config.defaultChildAttr.defaultAttrId[4]) {
                            // Then create object of next setting and populate the next value.
                            var fourthOptionObj = thirdOptionObj.nextSetting;

                            // Store the id of the Chain-Length select box.*/
                            var fourthAttrId = fourthOptionObj.id.replace(/[a-z]*/, '');

                            // Set the value.
                            if (spConfig.config.defaultChildAttr.defaultAttrValue[4]) {
                                fourthOptionObj.value = spConfig.config.defaultChildAttr.defaultAttrValue[4];
                            } else {
                                fourthOptionObj.value = fourthOptionObj.options[1].value;
                            }

                            // Change the data, as per the selected product.
                            changeData(fourthAttrId, fourthOptionObj.value);
                        }
                    }
                }

                /**
                 * Function to change the data, if the user clicks on the Metal Image.
                 */
                function changeData(attributeId, value)
                {
                    spConfig.changeData(attributeId, value);
                }
            }
        });
        
        var _parseOptions = function(options) {
            var opts = {
                byRow: true,
                property: 'height',
                target: null,
                remove: false
            };

            if (typeof options === 'object') {
                return $.extend(opts, options);
            }

            if (typeof options === 'boolean') {
                opts.byRow = options;
            } else if (options === 'remove') {
                opts.remove = true;
            }

            return opts;
        };
        
        var matchHeight = $.fn.matchHeight = function(options) {
            var opts = _parseOptions(options);

            // handle remove
            if (opts.remove) {
                var that = this;

                // remove fixed height from all selected elements
                this.css(opts.property, '');

                // remove selected elements from all groups
                $.each(matchHeight._groups, function(key, group) {
                    group.elements = group.elements.not(that);
                });

                // TODO: cleanup empty groups

                return this;
            }

            if (this.length <= 1 && !opts.target) {
                return this;
            }

            // keep track of this group so we can re-apply later on load and resize events
            matchHeight._groups.push({
                elements: this,
                options: opts
            });

            // match each element's height to the tallest element in the selection
            matchHeight._apply(this, opts);

            return this;
        };
    })(jQuery);
    
    $(document).ready(function() {
        if($(".catalog-category-view").length || $(".catalogsearch-result-index").length){
            /*setTimeout(function(){
                ArteriorsHome.catalog.productList();
            },1000);*/
            ArteriorsHome.catalog.catagoryListFilter();
        }
        /*if($(".catalog-category-view").length || $(".catalog-product-view").length){
            ArteriorsHome.catalog.spConfigListDetails();
        }
        /*if($(".catalog-product-view").length){
            ArteriorsHome.catalog.productView();
            ArteriorsHome.catalog.detailsContainer();
            ArteriorsHome.catalog.zoomImagefeature();
            ArteriorsHome.catalog.initAccordeon();
            ArteriorsHome.catalog.magnifiedImageClose();
        }
        if($(".storelocator-index-index").length){
            ArteriorsHome.catalog.initFindUs();
        }
        if($(".nav-container").length){
            ArteriorsHome.catalog.navigationEnable();
        }*/
    });
});