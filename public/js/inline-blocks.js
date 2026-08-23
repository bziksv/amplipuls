$(document).ready(function () {

        let $slider = $('#block12-1-slider-56').find('.block12-1-slides');

        $slider.on('init reInit', function(e, slick){
            slick.$slider.find('.slick-dots li').each(function () {
                $(this).addClass('theme-bg');
            });
            if (slick.$slider.find('.slick-track').children().length === 1) {
                slick.$slider.addClass('block12-1-oneslide');
            }
        });

        $slider.slick({
            arrows: true,
            dots: true,
            cssEase: 'linear',
            adaptiveHeight: true,
            prevArrow: $slider.siblings('.arrow-prev'),
            nextArrow: $slider.siblings('.arrow-next'),
            slidesToShow: 1,
        });

    });

$(document).ready(function () {
        let $slider = $('#block9-4-slider--218');

        $slider.on('init reInit', function(e, slick){
            slick.$slider.find('.slick-dots li').each(function () {
                $(this).addClass('theme-bg');
            });
            if (slick.$slider.find('.slick-track').children().length === 1) {
                slick.$slider.addClass('block9-4-oneslide');
            }
        });

        $slider.slick({
            infinite: true,
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true,
            prevArrow: $slider.siblings('.arrow-prev'),
            nextArrow: $slider.siblings('.arrow-next'),
        });
    });

function initMasks()
        {
                        $('.phone').inputmask('+7 (999) 999-99-99', {
                'showMaskOnHover': false
            });
                        $('.js-mask-date').inputmask('9{1,2}.9{1,2}.9999');
            $('.js-mask-integer').inputmask('integer', {
                rightAlign: false,
                placeholder: ''
            });
            $('.js-mask-interval-time').each(function () {
                let _this = $(this);
                _this.inputmask({
                    alias: 'datetime',
                    placeholder: '--:-- - --:--',
                    inputFormat: "HH:MM - HH:MM",
                    insertMode: false,
                    insertModeVisual: false,
                    showMaskOnHover: false,
                });
                _this.inputmask('setvalue', _this.attr('value'));
            });
        }
        $(document).on('change', '.js-mask-interval-time', function () {
            $(this).attr('value', $(this).val());
        });

deleteCookie('_ym_debug');
    
    $(document).ready(function(){
        $(document).on('click', '[data-metrics-click]', function () {
            const goal = $(this).data('metrics-click');
            submitJsGoal(goal);
        });
        $(document).on('rxFormSubmitted', function (e, data) {
            submitJsGoal(data.formCode);
        });
        $(document).on('click', 'a[href^="mailto:"]', function () {
            submitJsGoal('ranx_landing_email');
        });
        $(document).on('click', 'a[href^="tel:"]', function () {
            submitJsGoal('ranx_landing_phone');
        });

        function submitJsGoal(goalId) {
            if (typeof ym !== 'undefined') { // new version
                ym('97847458', 'reachGoal', goalId);
            } else if (typeof yaCounter97847458 !== 'undefined') { // old
                yaCounter97847458.reachGoal(goalId)
            }
        }
    });