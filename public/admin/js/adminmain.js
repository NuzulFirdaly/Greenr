(function($) {

    "use strict";

    $(".animsition").animsition({
        inClass: 'fade-in',
        outClass: 'fade-out',
        inDuration: 1500,
        outDuration: 800,
        linkElement: '.animsition-link',
        // e.g. linkElement: 'a:not([target="_blank"]):not([href^="#"])'
        loading: true,
        loadingParentElement: 'body', //animsition wrapper element
        loadingClass: 'animsition-loading',
        loadingInner: '', // e.g '<img src="loading.svg" />'
        timeout: false,
        timeoutCountdown: 5000,
        onLoadEvent: true,
        browser: ['animation-duration', '-webkit-animation-duration'],
        // "browser" option allows you to disable the "animsition" in case the css property in the array is not supported by your browser.
        // The default setting is to disable the "animsition" in a browser that does not support "animation-duration".
        overlay: false,
        overlayClass: 'animsition-overlay-slide',
        overlayParentElement: 'body',
        transition: function(url) { window.location.href = url; }
    });
})(jQuery);
//     var fullHeight = function() {

//         $('.js-fullheight').css('height', $(window).height());
//         $(window).resize(function() {
//             $('.js-fullheight').css('height', $(window).height());
//         });

//     };
//     fullHeight();

//     $('#sidebarCollapse').on('click', function() {
//         $('#sidebar').toggleClass('active');
//     });

//     var carousel = function() {
//         $('.featured-carousel').owlCarousel({
//             loop: false,
//             autoplay: false,
//             margin: 30,
//             URLhashListener: true,
//             animateOut: 'fadeOut',
//             animateIn: 'fadeIn',
//             nav: true,
//             dots: true,
//             autoplayHoverPause: false,
//             items: 1,
//             navText: ["<span class='ion-ios-arrow-back'></span>", "<span class='ion-ios-arrow-forward'></span>"],
//             responsive: {
//                 0: {
//                     items: 1
//                 },
//                 600: {
//                     items: 2
//                 },
//                 1000: {
//                     items: 3
//                 }
//             },
//         });

//     };

//     carousel();

//     $("#updateadmin").submit(function(e) {
//         e.preventDefault();
//         var formData = new FormData();

//         $.ajax({
//             url: "/admin/editprofile",
//             type: 'POST',
//             data: formData,
//             success: function(data) {
//                 alert(data)
//             },
//             cache: false,
//             contentType: "multipart/form-data",
//             processData: false
//         });
//     });

//     $(".inst_approve").on('click', function(e) {
//         var pending_institution_id = $(this).attr('id');
//         console.log(pending_institution_id)

//         $.ajax({
//             url: "/admin/certificate",
//             type: "POST",
//             data: { id: pending_institution_id, action: 'inst_approve' }, //send this to server
//             success: function(returned) {
//                 console.log(returned)
//                 console.log('aajaxworks'); // here can get the return of route
//                 $('#inst_' + pending_institution_id).modal('hide');
//                 window.location.reload();
//                 window.location.href = '#institution';
//             },
//             error: function() {
//                 console.log('aajaxdontwork');
//             }
//         });
//     });

//     $(".inst_reject").on('click', function(e) {
//         var pending_institution_id = $(this).attr('id');
//         console.log(pending_institution_id)

//         $.ajax({
//             url: "/admin/certificate",
//             type: "POST",
//             data: { id: pending_institution_id, action: 'inst_reject' }, //send this to server
//             success: function() {
//                 console.log('rajaxworks'); // here can get the return of route
//                 $('#inst_' + pending_institution_id).modal('hide');
//                 window.location.reload();
//                 window.location.href = '#institution';
//             },
//             error: function() {
//                 console.log('rajaxdontwork');
//             }
//         });
//     });

//     $("#createadmin").on('click', function(e) {
//         var newadmintarget = $('#newadminemail').val()
//         if (newadmintarget != "" && validateEmail(newadmintarget) == true) {
//             e.preventDefault();
//             // console.log(validateEmail($('#newadminemail').val()))
//             swal({
//                     title: "Are you sure?",
//                     text: "\nOnce created you are resposible for this approval\nEmail: " + newadmintarget,
//                     icon: "warning",
//                     buttons: true,
//                     dangerMode: true,
//                 })
//                 .then((willDelete) => {
//                     if (willDelete) {
//                         swal("Account is created!", {
//                             icon: "success",
//                         }).then(function(isConfirm) {
//                             if (isConfirm) {
//                                 window.location.reload();
//                                 window.location.href = '#createadminheader';
//                             }
//                         });
//                         $.ajax({
//                             url: "/admin/create",
//                             type: "POST",
//                             data: { id: newadmintarget, action: 'createadmin' }, //send this to server
//                             success: function(returned) {
//                                 console.log(returned)
//                                 console.log('aajaxworks'); // here can get the return of route
//                                 // window.location.reload();
//                                 // window.location.href = '#createadminheader';
//                             },
//                             error: function() {
//                                 console.log('aajaxdontwork');
//                             }
//                         });
//                     } else {
//                         swal("Account created is canceled!");
//                     }
//                 });
//         }
//     });

// })(jQuery);

// function findInOverview(searchval) {
//     $("input[aria-controls=instOverview]").val(searchval);
//     setTimeout(function() {
//         $('input[aria-controls=instOverview]').focus();
//     }, 650);
// }

// var loadFile = function(event) {
//     var reader = new FileReader();
//     reader.onload = function() {
//         var output = document.getElementById('output');
//         // output.style.backgroundImage = "url('" + reader.result + "');";
//         output.setAttribute("style", "height: 180px; width: 180px; background-image: url('" + reader.result + "');");
//         // output.src = reader.result;
//     };
//     reader.readAsDataURL(event.target.files[0]);
// };

// function validateEmail($email) {
//     var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
//     return emailReg.test($email);
// }