define(['jquery', 'mage/utils/wrapper', 'Amasty_CheckoutCore/js/model/events', 'Magento_Checkout/js/model/totals', 'Magento_Checkout/js/model/quote', 'Magento_Checkout/js/model/checkout-data-resolver', 'Magento_Checkout/js/model/shipping-rate-registry', 'Magento_Checkout/js/action/select-shipping-address', 'Magento_Checkout/js/action/get-totals', 'ko', 'Magento_Checkout/js/model/shipping-service', 'Magento_Checkout/js/model/shipping-save-processor', 'Magento_Customer/js/customer-data', 'Magento_Ui/js/modal/modal', 'Magento_Checkout/js/model/full-screen-loader', 'mage/validation'], function($, wrapper, events, totals, quote, checkoutDataResolver, rateRegistry, selectShippingAddress, getTotalsAction, ko, shippingService, shippingSaveProcessor, customerData, modal, fullScreenLoader) {
  'use strict';
  
  $(window).load(function() {
    var isValidate = 3;
    var address = quote.shippingAddress();
    var id = (quote.getQuoteId());
    var customerAddressId = "";
    if ($.isArray(address) && address.customerAddressId != null) {
      customerAddressId = (address.customerAddressId);
    }
    if (typeof customerAddressId === "undefined") {
      $("#validate-button-ck").hide();
    }
    var url = "custom/index/flags";
    $.ajax({
      'async': false,
      type: 'POST',
      url: window.BASE_URL + url,
      data: {
        'flag': isValidate,
        'customer_address_id': customerAddressId,
        'quote_id': id
      },
      success: function(responce) {
        if (responce.validate_flag == 1 || typeof customerAddressId === "undefined") {
          $("#validate-button-ck").hide();
        } else {
          $("#validate-button-ck").show();
        }
        if (responce.show_resale == 1) {
          $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
        }
        if (responce.show_resale == 0) {
          $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
        }
        if (responce.is_default_billing == 0) {
          $(".checkout-billing-address").addClass('show_billing_address');
        }
      }
    });
    var address = quote.shippingAddress();
    if (address && $.isArray(address)) {
      var street = (address.street).join(',');
      var postcode = (address.postcode);
      var city = (address.city);
      var region = (address.regionCode);
      var region_name = (address.region);
      var country = (address.countryId);
      var id = (quote.getQuoteId());
      var cust_id = (address.customerAddressId);
      var firstname = (address.firstname);
      var lastname = (address.lastname);
      var customer_id = (address.customerId);
      var telephone = (address.telephone);
      var url_validate = "custom/index/validate";
      jQuery.ajax({
        'async': false,
        type: 'POST',
        url: window.BASE_URL + url_validate,
        data: {
          'street': street,
          'postcode': postcode,
          'city': city,
          'region': region,
          'country': country
        },
        success: function(data) {
          if (data.status == "valid") {
            var residental = data.residental;
            var ck = "private";
            var unck = "business";
            if (residental == 1) {
              $("input[name=order_type][value=" + ck + "]").prop('checked', true);
            } else {
              $("input[name=order_type][value=" + unck + "]").prop('checked', true);
            }
          } else {}
        }
      });
    }
  });
  $(document).on('click', '.new-user-address-edit', function() {
    var url_flags = "custom/index/changequotevalidation";
    var address = quote.shippingAddress();
    var customer_address_id = (address.customerAddressId);
    var quote_id = quote.getQuoteId();
    $.ajax({
      'async': false,
      type: 'POST',
      url: window.BASE_URL + url_flags,
      data: {
        'customer_address_id': customer_address_id,
        'quote_id': quote_id
      },
      success: function(responce) {}
    });
    $('.new-user-address').show();
    $('.new-user-address-edit').hide();
    $('#shipping-new-address-form select').css("pointer-events", "");
    $('#shipping-new-address-form select').off('blur focus');
    $(document).off("blur", "#shipping-new-address-form select");
    $('#shipping-new-address-form input').removeAttr("readonly");
  });
  $(document).on('change', 'select[name="region_id"]', function() {
    var regionvalueSelected = $('select[name=region_id] option:selected').val();
    if (regionvalueSelected != "") {
      $('div[name="shippingAddress.region_id"]').removeClass('_error');
      $('.custom-error-region').remove();
    }
  });
  $(document).on('change', 'select[name="country_id"]', function() {
    var countrynvalueSelected = $('select[name=country_id] option:selected').val();
    if (countrynvalueSelected != "") {
      $('div[name="shippingAddress.country_id"]').removeClass('_error');
      $('.custom-error-country').remove();
    }
  });
  var options = {
    type: 'popup',
    responsive: true,
    innerScroll: true,
    buttons: false,
    modalClass: 'form-overlay',
    clickableOverlay: false
  };
  $(document).on('click', "#verify-address", function() {
    if ($('#opc-new-shipping-address').css('display') == 'block' || $('#opc-new-shipping-address').length == 0) {
      var address = quote.shippingAddress();
      var customer_address_id = (address.customerAddressId);
      var quote_id = quote.getQuoteId();
      var firstname = $('input[name="firstname"]').val();
      var lastname = $('input[name="lastname"]').val();
      var company = $('input[name="company"]').val();
      if (company) {
        company = company + '<br>';
      } else {
        company = "";
      }
      var add1 = $('input[name="street[0]"]').val();
      var add2 = $('input[name="street[1]"]').val();
      var city = $('input[name="city"]').val();
      var postcode = $('input[name="postcode"]').val();
      var country = $('select[name=country_id] option:selected').val();
      var region = $('select[name=region_id] option:selected').val();
      var regionName = $('input[name="region"]').val();
      var telephone = $('input[name="telephone"]').val();
      if ($('div[name="shippingAddress.region_id"]').is(":visible")) {} else {
        region = 'addcondtion';
      }
      if ($('#shipping-new-address-form div.field').hasClass("_error")) {
        return;
      }
      if (add1.trim() == '' || city.trim() == '' || postcode.trim() == '' || country.trim() == '' || telephone.trim() == '' || region == '') {
        if (add1.trim() == '') {
          $('#shipping-new-address-form input[name="street[0]"]').val(' ');
          $('#shipping-new-address-form input[name="street[0]"]').change();
        }
        if (city.trim() == '') {
          $('#shipping-new-address-form input[name="city"]').val(' ');
          $('#shipping-new-address-form input[name="city"]').trigger("keyup");
        }
        if (postcode.trim() == '') {
          $('#shipping-new-address-form input[name="postcode"]').val(' ');
          $('#shipping-new-address-form input[name="postcode"]').trigger("change");
        }
        if (region == '') {
          if (!$('div[name="shippingAddress.region_id"]').hasClass("_error")) {
            if ($('div.custom-error-region').length == 0) {
              $('#shipping-new-address-form select[name="region_id"]').after('<div class="field-error custom-error-region" data-bind="attr: { id: element.errorId }" generated="true" id="error-FAASO4M"> <span data-bind="text: element.error">This is a required field.</span></div>')
              $('#shipping-new-address-form select[name="region_id"]').trigger("keyup");
            }
          }
        }
        if (country == '') {
          if (!$('div[name="shippingAddress.country_id"]').hasClass("_error")) {
            if ($('div.custom-error-country').length == 0) {
              $('#shipping-new-address-form select[name="country_id"]').after('<div class="field-error custom-error-country" data-bind="attr: { id: element.errorId }" generated="true" id="error-FAASO4M"> <span data-bind="text: element.error">This is a required field.</span></div>');
              $('#shipping-new-address-form select[name="country_id"]').trigger("change");
            }
          }
        }
        if (telephone.trim() == '') {
          $('input[name="telephone"]').val(' ');
          $('input[name="telephone"]').trigger("keyup");
        }
        return false;
      }
      if (region == '' || region == 'addcondtion') {
        region = regionName;
      }
      if (add1 && city && postcode && country) {
        var url_form = "custom/index/form";
        $.ajax({
          'async': false,
          type: 'POST',
          url: window.BASE_URL + url_form,
          data: {
            'address1': add1,
            'address2': add2,
            'city': city,
            'postcode': postcode,
            'country': country,
            'region': region
          },
          success: function(data) {
            var residental = data.residental_flag;
            if ("isresidental" in localStorage) {
              window.localStorage.removeItem('isresidental');
            }
            window.localStorage.setItem('isresidental', residental);
            if (data.status == "valid" || data.status == 'validapproximate') {
              var datastreet1 = '';
              var datacity = '';
              var dataorignal_region = '';
              var datastate = '';
              var localStorageData = {
                'street1': data.street1,
                'street2': data.street2,
                'city': data.city,
                'postcode': data.pincode,
                'country': data.country,
                'region': data.state,
                'regionId': data.region_new_id,
                'residental_type': data.residental_flag
              };
              if ("suggestedAddress" in localStorage) {
                window.localStorage.removeItem('suggestedAddress');
              }
              window.localStorage.setItem('suggestedAddress', JSON.stringify(localStorageData));
              if (add1) {
                add1 = add1.toLowerCase();
              }
              if (data.city) {
                var datacity = data.city.toLowerCase();
              }
              if (data.orignal_region) {
                var dataorignal_region = data.orignal_region.toLowerCase();
              }
              if (data.state) {
                var datastate = data.state.toLowerCase();
              }
              if (data.street1) {
                var datastreet1 = data.street1.toLowerCase();
              }
              if (add1 == datastreet1 && postcode == data.pincode && city.toLowerCase() == datacity && dataorignal_region == datastate) {
                $("#events_popup").html('<div class="main" style="padding:20px;"><br><div class="disclaimer"><p style="color:black;align:center;"><b>Your Address is Valid</b></p></div><hr><div style="border:1px solid lightgray;padding:15px;">&nbsp;<b>Original Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + add1 + '&nbsp;' + add2 + '<br>' + city + ',&nbsp;' + data.orignal_region + '&nbsp;' + postcode + '<br>' + data.country + '<br></div><div style="border:1px solid lightgray;padding:15px;">&nbsp;<b>Suggested Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + '<span style="">' + data.street1 + '<br>' + data.street2 + '</span><br><span style="">' + data.city + '</span>,&nbsp;<span>' + data.state + '</span>&nbsp;<span style="">' + data.pincode + '</span><br>' + data.country + '</div><hr><button id ="close_form_popup_wrong_address" type="button" style="font-weight: 700 !important;letter-spacing: 4px !important;color: #3b372a !important;text-transform: uppercase !important;padding-bottom: 10px !important;border-bottom: 4px solid #6d6d6d !important;background: 0 0 !important;font-size: 14px;padding: .75em 0;padding-bottom: 0.75em;line-height: 1.42857;border-top: none;border-left: none;border-right: none;">OK</button>').modal(options).modal('openModal');
                var isValidate = 2;
                var url = "custom/index/ChangeAddress";
                jQuery.ajax({
                  type: 'POST',
                  url: window.BASE_URL + url,
                  data: {
                    'cust_id': customer_address_id,
                    'isresidental': data.residental_flag,
                    'isValidate': isValidate,
                    'id': quote_id
                  },
                  success: function(data) {
                    if (data['show_resale'] == 1) {
                      $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
                      $("select[name=disabled]").attr('name', 'manual_tax');
                    }
                    if (data['show_resale'] == 0) {
                      $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
                      $("select[name=manual_tax]").attr('name', 'disabled');
                    }
                  }
                });
              } else {
                if (add1 == datastreet1) {
                  var color_1 = "color:black;";
                } else {
                  var color_1 = "color:red;border:1px solid red;padding:5px;";
                }
                if (postcode == data.pincode) {
                  var color_2 = "color:black;";
                } else {
                  var color_2 = "color:red;border:1px solid red;padding:5px;";
                }
                if (city.toLowerCase() == datacity) {
                  var color_3 = "color:black;";
                } else {
                  var color_3 = "color:red;border:1px solid red;padding:5px;";
                }
                if (dataorignal_region == datastate) {
                  var colo3r = "color:black;";
                } else {
                  var color3 = "color:red;border:1px solid red;padding:5px;";
                }
                $("#events_popup").html('<h3>Verify Your Address</h3><p>There is a problem with the address you have provided. We have marked our suggestions in red below. Please choose or edit which version of the address you want to use.</p><div class="main" style=""><div style="border:1px solid lightgray;padding:15px;"><input type="radio" name="form-address" value="0" style="padding:10px;" checked="checked">&nbsp;<b>Original Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + add1 + '&nbsp;' + add2 + '<br>' + city + ',&nbsp;' + data.orignal_region + '&nbsp;' + postcode + '<br>' + data.country + '</label><br></div><div style="border:1px solid lightgray;padding:15px;"><input type="radio" name="form-address" value="1" style="padding:10px;">&nbsp;<b>Suggested Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + '<span style="' + color_1 + '">' + data.street1 + data.street2 + '</span><br><span style="' + color_3 + '">' + data.city + '</span>,&nbsp;<span style="' + color3 + '">' + data.state + '</span>&nbsp;<span style="' + color_2 + '">' + data.pincode + '</span><br>' + data.country + '</div></div><br><div><p><b>' + data.valid + '</b></p></div><button id ="save_form_data" type="button" style="font-weight: 700 !important;letter-spacing: 4px !important;color: #3b372a !important;text-transform: uppercase !important;padding-bottom: 10px !important;border-bottom: 4px solid #6d6d6d !important;background: 0 0 !important;font-size: 14px;padding: .75em 0;padding-bottom: 0.75em;line-height: 1.42857;border-top: none;border-left: none;border-right: none;">Update Address</button>').modal(options).modal('openModal');
              }
            } else {
              var isValidate = 2;
              $("#events_popup").html('<div class="main" style="padding:20px;"><div class="text">Your Selected Address is Invalid</div><br><div class="disclaimer"><p style="color:black;"><b>' + data.inval + '</b></p><div></div></div><hr><button id="close_form_popup_wrong_address" type="button" style="font-weight: 700 !important;letter-spacing: 4px !important;color: #3b372a !important;text-transform: uppercase !important;padding-bottom: 10px !important;border-bottom: 4px solid #6d6d6d !important;background: 0 0 !important;font-size: 14px;padding: .75em 0;padding-bottom: 0.75em;line-height: 1.42857;border-top: none;border-left: none;border-right: none;">OK</button>').modal(options).modal('openModal');
            }
          }
        });
      }
      $.ajax({
        url: window.BASE_URL +"chargelogic/index/chargeresponseajax",
        type: 'POST',
        dataType: 'json',
        success: function (response) {
          $('button#authorize_button').data('authorize','no');
          $('button#edit_authorize_button').css('display','none');
          $('button#authorize_button').attr("disabled", false);
          $('iframe#chargelogic_frame').css('pointer-events','inherit');
          $('body').trigger('processStop');
          var newsrc= 'https://connect.chargelogic.com/?HostedPaymentID='+response.hostedId;
          $("iframe#chargelogic_frame").attr("src", newsrc);
        },
        error: function(xhr, status, error){
          console.log("Cannot get data");
        }
      });
    } else {
      $('#update-action').click();
      var isValidate = 3;
      var address = quote.shippingAddress();
      var customerAddressId = (address.customerAddressId);
      var id = (quote.getQuoteId());
      var url = "custom/index/flags";
      $.ajax({
        url: window.BASE_URL + url,
        data: {
          'flag': isValidate,
          'customer_address_id': customerAddressId,
          'quote_id': id,
          'quote_ids': 'neww1'
        },
        type: 'post',
        success: function(data) {
          if (data) {
            if (data['validate_flag'] == 1) {
              $("#validate-button-ck").hide();
            } else {
              $("#validate-button-ck").show();
            }
            if (data['show_resale'] == 1) {
              $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
              $("select[name=disabled]").attr('name', 'manual_tax');
              $("select[name=manual_tax] option:first").prop('selected', true).trigger('change');
            }
            if (data['show_resale'] == 0) {
              $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
              $("select[name=manual_tax]").attr('name', 'disabled');
            }
            var ck = "private";
            var unck = "business";
            if (data['residental_flag'] == 1) {
              $("input[name=order_type][value=" + ck + "]").prop('checked', true);
            } else {
              $("input[name=order_type][value=" + unck + "]").prop('checked', true);
            }
          }
        }
      });
    }
  });
  $(document).on('click', "#save_form_data", function() {
    var selected_value = $('input[name="form-address"]:checked').val();
    $("#save_form_data").prop('disabled', true);
    var isValidate = 0;
    var address = quote.shippingAddress();
    var customer_address_id = (address.customerAddressId);
    var quote_id = (quote.getQuoteId());
    if (selected_value == 1) {
      var ck = "private";
      var unck = "business";
      var suggestedAddress = window.localStorage.getItem('suggestedAddress');
      suggestedAddress = JSON.parse(suggestedAddress);
      if (suggestedAddress.regionId) {
        var regionId = suggestedAddress.regionId;
      } else {
        var varValidateState = suggestedAddress.region;
      }
      if (suggestedAddress.residental_type == 1) {
        $("input[name=order_type][value=" + ck + "]").prop('checked', true);
      } else {
        $("input[name=order_type][value=" + unck + "]").prop('checked', true);
      }
      var residental = window.localStorage.getItem('isresidental');
      var isValidate = 1;
      var url_flags = "custom/index/flags";
      $.ajax({
        'async': true,
        type: 'POST',
        url: window.BASE_URL + url_flags,
        data: {
          'flag': isValidate,
          'customer_address_id': customer_address_id,
          'quote_id': quote_id,
          'residental': residental,
        },
        success: function(responce) {
          if (responce['show_resale'] == 1) {
            $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
            $("select[name=disabled]").attr('name', 'manual_tax');
            $("select[name=manual_tax] option:first").prop('selected', true).trigger('change');
          }
          if (responce['show_resale'] == 0) {
            $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
            $("select[name=manual_tax]").attr('name', 'disabled');
          }
        }
      });
      $('input[name="city"]').val(suggestedAddress.city);
      $('input[name="postcode"]').val(suggestedAddress.postcode);
      $('input[name="street[0]"]').val(suggestedAddress.street1);
      $('input[name="street[1]"]').val(suggestedAddress.street2);
      if (suggestedAddress.regionId) {
        $('select[name="region_id"]').val(suggestedAddress.regionId);
      }
      $('input[name="region"]').val(suggestedAddress.region);
      $('input[name="street[0]"]').change();
      $('input[name="street[1]"]').change();
      $('input[name="city"]').change();
      $('input[name="postcode"]').change();
      if (suggestedAddress.regionId) {
        $('select[name="region_id"]').change();
      }
      $('input[name="region"]').change();
      var address = quote.shippingAddress();
      if (suggestedAddress.street2) {
        var street = suggestedAddress.street1 + ',' + suggestedAddress.street2;
      } else {
        var street = suggestedAddress.street1;
      }
      var postcode = (suggestedAddress.postcode);
      var city = (suggestedAddress.city);
      city = city.replace(/[_\W]+/g, "");
      if (suggestedAddress.regionId) {
        var region = suggestedAddress.regionId;
      } else {
        var region = suggestedAddress.region;
      }
      var region_name = (address.region);
      var country = (address.countryId);
      var firstname = (address.firstname);
      var lastname = (address.lastname);
      var telephone = (address.telephone);
      var customer_id = (address.customerId);
      var datanew = {
        "name": firstname + ' ' + lastname,
        "street": street,
        "postcode": postcode,
        "city": city,
        "state": region_name,
        "country": country,
        "telephone": telephone
      };
      $.ajax({
        url: window.BASE_URL + "chargelogic/index/chargeresponseajax",
        type: 'POST',
        dataType: 'json',
        data: datanew,
        'async': true,
        success: function(response) {
          var newsrc = 'https://connect.chargelogic.com/?HostedPaymentID=' + response.hostedId;
          $("iframe#chargelogic_frame").attr("src", newsrc);
        },
        error: function(xhr, status, error) {
          console.log("Cannot get data");
        }
      });
      var updateAction = $('#update-action');
      if (updateAction.length) {
        $('#update-action').click();
      } else {
        $("#events_popup").modal('closeModal');
      }
      $("#validate-button-ck").hide();
      if ($('#opc-new-shipping-address').length == 0) {
        $(".new-user-address").hide();
        $(".new-user-address-edit").show();
        $('#shipping-new-address-form select').attr("style", "pointer-events: none;").on('focus', function() {
          $(this).blur();
        });
        $('#shipping-new-address-form input').attr('readonly', 'readonly');
      }
    } else {
      var url_flags = "custom/index/flags";
      $.ajax({
        'async': true,
        type: 'POST',
        url: window.BASE_URL + url_flags,
        data: {
          'flag': isValidate,
          'customer_address_id': customer_address_id,
          'quote_id': quote_id,
          'residental': residental
        },
        success: function(responce) {
          if (responce['show_resale'] == 1) {
            $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
            $("select[name=disabled]").attr('name', 'manual_tax');
            $("select[name=manual_tax] option:first").prop('selected', true).trigger('change');
          }
          if (responce['show_resale'] == 0) {
            $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
            $("select[name=manual_tax]").attr('name', 'disabled');
          }
        }
      });
      chargelogicHostedIDMethod(quote);
      var updateAction = $('#update-action');
      if (updateAction.length) {
        $('#update-action').click();
      } else {
        $("#events_popup").modal('closeModal');
      }
      $("#validate-button-ck").hide();
      if ($('#opc-new-shipping-address').length == 0) {
        $(".new-user-address").hide();
        $(".new-user-address-edit").show();
        $('#shipping-new-address-form select').attr("style", "pointer-events: none;").on('focus', function() {
          $(this).blur();
        });
        $('#shipping-new-address-form input').attr('readonly', 'readonly');
      }
    }
  });
  $(document).on('click', "#close_form_popup_wrong_address", function(e) {
    $(this).prop('disabled', true);
    fullScreenLoader.startLoader();
    updateFlags(quote);
    chargelogicHostedIDMethod(quote);
    var updateAction = $('#update-action');
    if (updateAction.length) {
      $('#update-action').click();
    } else {
      $("#events_popup").modal('closeModal');
    }
    $("#validate-button-ck").hide();
    if ($('#opc-new-shipping-address').length == 0) {
      $(".new-user-address").hide();
      $(".new-user-address-edit").show();
      $('#shipping-new-address-form select').attr("style", "pointer-events: none;").on('focus', function() {
        $(this).blur();
      });
      $('#shipping-new-address-form input').attr('readonly', 'readonly');
    }
    $(this).prop('disabled', false);
    fullScreenLoader.stopLoader();
  });
  function updateFlags(quote) {

    var address = quote.shippingAddress();
    var customer_address_id = (address.customerAddressId);
    var quote_id = (quote.getQuoteId());
    var isValidate = 1;
    var url_flags = "custom/index/flags";
    $.ajax({
      'async': true,
      type: 'POST',
      url: window.BASE_URL + url_flags,
      data: {
        'flag': isValidate,
        'customer_address_id': customer_address_id,
        'quote_id': quote_id
      },
      success: function(responce) {
        if (responce ['show_resale'] == 1) {
          $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
          $("select[name=disabled]").attr('name', 'manual_tax');
          $("select[name=manual_tax] option:first").prop('selected', true).trigger('change');
        }
        if (responce['show_resale'] == 0) {
          $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
          $("select[name=manual_tax]").attr('name', 'disabled');
        }
      },
      error: function(xhr, status, error) {

      }
    });
  }


  $(document).on('click', "#update-action", function() {
    if ($('#opc-new-shipping-address').css('display') == 'block' || $('#opc-new-shipping-address').length == 0) {
      var region = $('select[name=region_id] option:selected').val();
      var countryId = $('select[name=country_id] option:selected').val();
      var regionName = $('input[name="region"]').val();
      if (!region) {
        region = regionName;
      }
      $("#events_popup").modal('closeModal');
      var isValidate = 'checkTax';
      var url = "custom/index/flags";
      $.ajax({
        'async': true,
        type: 'POST',
        url: window.BASE_URL + url,
        data: {
          'flag': isValidate,
          'regionId': region,
          'countryId': countryId,
        },
        success: function(responce) {
          if (responce.show_resale == 1) {
            $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
            $("select[name=disabled]").attr('name', 'manual_tax');
            $("select[name=manual_tax] option:first").prop('selected', true).trigger('change');
          } else {
            $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
            $("select[name=manual_tax]").attr('name', 'disabled');
          }
        }
      });
    }
  });
  $(document).on('click', "button.action-cancel", function() {
    var address = quote.shippingAddress();
    var id = (quote.getQuoteId());
    var customerAddressId = (address.customerAddressId);
    var isValidate = 3;
    var region = $('select[name=region_id] option:selected').val();
    var countryId = $('select[name=country_id] option:selected').val();
    var regionName = $('input[name="region"]').val();
    if (!region) {
      region = regionName;
    }
    $("#events_popup").modal(options).modal('closeModal');
    var url = "custom/index/flags";
    $.ajax({
      'async': true,
      type: 'POST',
      url: window.BASE_URL + url,
      data: {
        'flag': isValidate,
        'quote_id': id,
        'customer_address_id': customerAddressId,
      },
      success: function(responce) {
        if (responce.validate_flag == 1 || typeof customerAddressId === "undefined") {
          $("#validate-button-ck").hide();
        } else {
          $("#validate-button-ck").show();
        }
      }
    });
  });
  $(document).on('click', "#close", function() {
    $("#events_popup").modal('closeModal');
  });
  $(document).on('click', "#validate-button-ck", function() {
    var address = quote.shippingAddress();
    var street = (address.street).join(',');
    var postcode = (address.postcode);
    var company = (address.company);
    if (company) {
      company = company + '<br>';
    } else {
      company = "";
    }
    var city = (address.city);
    var region = (address.regionCode);
    var region_name = (address.region);
    var country = (address.countryId);
    var id = (quote.getQuoteId());
    var cust_id = (address.customerAddressId);
    var firstname = (address.firstname);
    var lastname = (address.lastname);
    var customer_id = (address.customerId);
    var url1 = "custom/index/address";
    if (region == '') {
      region = region_name;
    }
    jQuery.ajax({
      type: 'POST',
      url: window.BASE_URL + url1,
      data: {
        'street': street,
        'postcode': postcode,
        'city': city,
        'region': region,
        'country': country
      },
      success: function(data) {
        var residental_flag = data.residental;
        if (data.status == "valid" || data.status == "validapproximate") {
          var datastreet = '';
          var datacity = '';
          var datastate = '';
          if (data.city) {
            var datacity = data.city.toLowerCase();
          }
          if (region_name) {
            var region_name = region_name.toLowerCase();
          }
          if (data.state) {
            datastate = data.state.toLowerCase();
          }
          if (street) {
            street = street.toLowerCase();
          }
          if (street == data.street) {
            var color = "color:black;";
          } else {
            var color = "color:red;border:1px solid red;padding:5px;";
          }
          if (postcode == data.postcode) {
            var color1 = "color:black;";
          } else {
            var color1 = "color:red;border:1px solid red;padding:5px;";
          }
          if (city.toLowerCase() == datacity) {
            var colo2r = "color:black;";
          } else {
            var color2 = "color:red;border:1px solid red;padding:5px;";
          }
          if (region_name == datastate) {
            var colo3r = "color:black;";
          } else {
            var color3 = "color:red;border:1px solid red;padding:5px;";
          }
          if (!region_name) {
            region_name = '';
          }
          if (!data.state) {
            data.state = '';
          }
          if (street == datastreet && postcode == data.postcode && city.toLowerCase() == datacity && region_name == datastate) {
            var url = "custom/index/ChangeAddress";
            var isValidate = 7;
            jQuery.ajax({
              type: 'POST',
              url: window.BASE_URL + url,
              data: {
                'cust_id': cust_id,
                'id': id,
                'customerId': customer_id,
                'isresidental': data.residental,
                'isValidate': isValidate
              },
              success: function(data) {
                if (data['show_resale'] == 1) {
                  $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
                  $("select[name=disabled]").attr('name', 'manual_tax');
                  $("select[name=manual_tax] option:first").prop('selected', true).trigger('change');
                }
                if (data['show_resale'] == 0) {
                  $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
                  $("select[name=manual_tax]").attr('name', 'disabled');
                }
              }
            });
            $("#events_popup").html('<div class="main" style="padding:20px;"><br><div class="disclaimer"><p style="color:black;align:center"><b>Your Address is Valid</b></p></div><hr><div style="border:1px solid lightgray;padding:15px;">&nbsp;<b>Original Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + street + '<br>' + city + ',&nbsp;' + region_name + '&nbsp;' + postcode + '<br>' + data.country + '<br></div><div style="border:1px solid lightgray;padding:15px;">&nbsp;<b>Suggested Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + '<span style="' + color + '">' + data.street + '</span><br><span style="' + color2 + '">' + data.city + '</span>,&nbsp;<span style="' + color3 + '">' + data.state + '</span>&nbsp;<span style="' + color1 + '">' + data.postcode + '</span><br>' + data.country + '</div><hr><button id ="close" type="button" style="font-weight: 700 !important;letter-spacing: 4px !important;color: #3b372a !important;text-transform: uppercase !important;padding-bottom: 10px !important;border-bottom: 4px solid #6d6d6d !important;background: 0 0 !important;font-size: 14px;padding: .75em 0;padding-bottom: 0.75em;line-height: 1.42857;border-top: none;border-left: none;border-right: none;">OK</button>').modal(options).modal('openModal');
            $("#validate-button-ck").hide();
            if ($('#opc-new-shipping-address').length == 0) {
              $(".new-user-address").hide();
              $(".new-user-address-edit").show();
              $('#shipping-new-address-form select').attr("style", "pointer-events: none;").on('focus', function() {
                $(this).blur();
              });
              $('#shipping-new-address-form input').attr('readonly', 'readonly');
            }
          } else {
            var ck = "private";
            var unck = "business";
            var residental_val = data.residental;
            if (residental_val == 1) {
              $("input[name=order_type][value=" + ck + "]").prop('checked', true);
            } else {
              $("input[name=order_type][value=" + unck + "]").prop('checked', true);
            }
            $("#events_popup").html('<h3>Verify Your Address</h3><p>There is a problem with the address you have provided. We have marked our suggestions in red below. Please choose or edit which version of the address you want to use.</p><div class="main" style=""><div style="border:1px solid lightgray;padding:15px;"><input type="radio" name="address" value="0" style="padding:10px;" checked="checked">&nbsp;<b>Original Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + street + '<br>' + city + ',&nbsp;' + data.oldstate + '&nbsp;' + postcode + '<br>' + data.country + '</label><br></div><div style="border:1px solid lightgray;padding:15px;"><input type="radio" name="address" value="1" style="padding:10px;">&nbsp;<b>Suggested Address:</b><br>' + firstname + '&nbsp;' + lastname + '<br>' + company + '<span style="' + color + '">' + data.street + '</span><br><span style="' + color2 + '">' + data.city + '</span>,&nbsp;<span style="' + color3 + '">' + data.state + '</span>&nbsp;<span style="' + color1 + '">' + data.postcode + '</span><br>' + data.country + '</div></div><br><div><p><b>' + data.valid + '</b></p></div><button id ="save_add_popup" type="button" style="font-weight: 700 !important;letter-spacing: 4px !important;color: #3b372a !important;text-transform: uppercase !important;padding-bottom: 10px !important;border-bottom: 4px solid #6d6d6d !important;background: 0 0 !important;font-size: 14px;padding: .75em 0;padding-bottom: 0.75em;line-height: 1.42857;border-top: none;border-left: none;border-right: none;">Save Address</button>').modal(options).modal('openModal');
            $(document).on('click', "#save_add_popup", function() {
              fullScreenLoader.startLoader();
              var val = $('input[name="address"]:checked').val();
              var url = "custom/index/ChangeAddress";
              var isValidate = 0;
              if (val == "1") {
                var isValidate = 1;
                jQuery.ajax({
                  type: 'POST',
                  url: window.BASE_URL + url,
                  data: {
                    'cust_id': cust_id,
                    'id': id,
                    'firstname': firstname,
                    'lastname': lastname,
                    'street': data.street,
                    'city': data.city,
                    'postcode': data.postcode,
                    'state': data.state,
                    'state_id': data.region_new_id,
                    'country': data.country,
                    'country_id': data.country_id,
                    'customerId': customer_id,
                    'isresidental': data.residental,
                    'isValidate': isValidate
                  },
                  success: function(data) {
                    $("#events_popup").modal(options).modal('closeModal');
                    location.reload();
                  }
                });
              } else {
                jQuery.ajax({
                  type: 'POST',
                  url: window.BASE_URL + url,
                  data: {
                    'cust_id': cust_id,
                    'id': id,
                    'customerId': customer_id,
                    'isresidental': data.residental,
                    'isValidate': isValidate
                  },
                  success: function(data) {
                    if (data['show_resale'] == 1) {
                      $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
                      $("select[name=disabled]").attr('name', 'manual_tax');
                      $("select[name=manual_tax]").val('no');
                    }
                    if (data['show_resale'] == 0) {
                      $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
                      $("select[name=manual_tax]").attr('name', 'disabled');
                    }
                  }
                });
                $("#events_popup").modal('closeModal');
                $("#validate-button-ck").hide();
                fullScreenLoader.stopLoader();
              }
            });
          }
        } else {
          var url = "custom/index/ChangeAddress";
          var isValidate = 2;
          jQuery.ajax({
            type: 'POST',
            url: window.BASE_URL + url,
            data: {
              'cust_id': cust_id,
              'id': id,
              'customerId': customer_id,
              'isresidental': data.residental,
              'isValidate': isValidate
            },
            success: function(data) {
              if (data['show_resale'] == 1) {
                $("div[name='shippingAddress.manual_tax']").addClass('display-manual-tax');
                $("select[name=disabled]").attr('name', 'manual_tax');
              }
              if (data['show_resale'] == 0) {
                $("div[name='shippingAddress.manual_tax']").removeClass('display-manual-tax');
                $("select[name=manual_tax]").attr('name', 'disabled');
              }
            }
          });
          $("#events_popup").html('<div class="main" style="padding:20px;"><div class="text">Your Selected Address is Invalid</div><br><div class="disclaimer"><p style="color:black;"><b>' + data.inval + '</b></p><div></div></div><hr><button id ="close" type="button" style="font-weight: 700 !important;letter-spacing: 4px !important;color: #3b372a !important;text-transform: uppercase !important;padding-bottom: 10px !important;border-bottom: 4px solid #6d6d6d !important;background: 0 0 !important;font-size: 14px;padding: .75em 0;padding-bottom: 0.75em;line-height: 1.42857;border-top: none;border-left: none;border-right: none;">OK</button>').modal(options).modal('openModal');
          $("#validate-button-ck").hide();
        }
      }
    });
  });

  function chargelogicHostedIDMethod(quote) {
    var address = quote.shippingAddress();
    var street = (address.street).join(',');
    var postcode = (address.postcode);
    var city = (address.city);
    city = city.replace(/[_\W]+/g, "");
    var region = (address.regionCode);
    var region_name = (address.region);
    var country = (address.countryId);
    var firstname = (address.firstname);
    var lastname = (address.lastname);
    var telephone = (address.telephone);
    var customer_id = (address.customerId);
    var datanew = {
      "name": firstname + ' ' + lastname,
      "street": street,
      "postcode": postcode,
      "city": city,
      "state": region_name,
      "country": country,
      "telephone": telephone
    };
    $.ajax({
      url: window.BASE_URL + "chargelogic/index/chargeresponseajax",
      type: 'POST',
      dataType: 'json',
      data: datanew,
      'async': true,
      success: function(response) {
        var newsrc = 'https://connect.chargelogic.com/?HostedPaymentID=' + response.hostedId;
        $("iframe#chargelogic_frame").attr("src", newsrc);
      },
      error: function(xhr, status, error) {
        console.log("Cannot get data");
      }
    });
  }
  return function(setShippingInformationAction) {
    return wrapper.wrap(setShippingInformationAction, function(original) {
      events.trigger('before_shipping_save');
      totals.isLoading(true);
      return original().always(function() {
        events.trigger('after_shipping_save');
        totals.isLoading(false);
      });
    });
  };
});
