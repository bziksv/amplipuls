$(document).ready(function () {
  if (typeof ymaps !== 'undefined') {
    ymaps.ready(block11_1_init);
  } else {
    $('#block_60').find('.map-wrapper').addClass('empty');
  }

  function block11_1_init() {
    const $component = $('#block_60').find('.block');
    const $listItemsWrap = $component.find('[data-list_items_wrapper]');
    const $listItems = $component.find('[data-list_item]');
    const $detailListItemsWrap = $component.find('[data-detail_list_wrapper]');
    const $detailListItems = $component.find('[data-detail_item]');
    const $detailClose = $component.find('[data-detail_close]');
    const animationTime = 200;

    $listItems.on('click', function (e, hasBalloon) {
      const _this = $(this);
      const itemID = _this.data('list_item');
      const $detailItem = $component.find('[data-detail_item="' + itemID + '"]');
      const arCord = _this.data('coordinates').split(',');

      if (_this.data('coordinates') && !hasBalloon) {
        closeBalloons11_1(geoObjects);
        map.setCenter([arCord[0], arCord[1]], 17, { checkZoomRange: true });
      }

      $listItemsWrap.fadeOut(animationTime, function () {
        $detailListItemsWrap.show();
        $detailListItems.hide();
        $detailItem.fadeIn(animationTime);
      });
    });

    $detailClose.on('click', function () {
      closeBalloons11_1(geoObjects);
      if (points.length) {
        map.setBounds(clusterer.getBounds(), { checkZoomRange: true });
      }
      const $detailItemActive = $component.find('[data-detail_item]:visible');
      $detailItemActive.fadeOut(animationTime, function () {
        $detailListItemsWrap.hide();
        $listItemsWrap.fadeIn(animationTime);
      });
    });

    const points = [['51.693636', '39.181063']];
    const itemIds = ['57'];

    const map = new ymaps.Map(
      'map_60',
      {
        center: [55.76, 37.64],
        zoom: 17,
        controls: ['geolocationControl', 'zoomControl'],
      },
      {
        geolocationControlFloat: 'right',
        zoomControlFloat: 'none',
        zoomControlPosition: { right: '10px', top: '50px' },
        maxZoom: 20,
      }
    );

    const clusterIcons = [{ size: [56, 56], offset: [-28, -28] }];

    const markerSVG =
      '<div class="marker_custom">' +
      '<style>.cls-marker{position: absolute;bottom: 0;left: 0;}</style>' +
      '<svg class="cls-marker" width="46" height="58" viewBox="0 0 46 58" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M43 23C43 31 35.5 39 30.5 45C25.5 51 23 55 23 55C23 55 20.6033 51.09 15.5 45C10.6078 39.1619 2.99998 31.3205 3 23C3.00002 11.9543 11.9543 3 23 3C34.0457 3 43 11.9543 43 23Z" fill="#16A773"/>' +
      '<path d="M22.9935 56.5C22.4741 56.4977 21.9929 56.2269 21.7213 55.7842L21.7213 55.7842L22.9935 56.5ZM22.9935 56.5C23.5128 56.5022 23.9963 56.2357 24.2717 55.7954M22.9935 56.5L24.2717 55.7954M24.272 55.795L24.2724 55.7943L24.2765 55.7878L24.2956 55.7576C24.3132 55.7299 24.3406 55.6871 24.3776 55.6296C24.4518 55.5147 24.5648 55.3413 24.7168 55.1133C25.0208 54.6573 25.4804 53.9831 26.0956 53.1219C27.3261 51.3992 29.1784 48.929 31.6523 45.9603C32.1237 45.3947 32.6228 44.8051 33.1399 44.1943C35.3147 41.6254 37.8061 38.6825 39.8731 35.5821C42.4269 31.7513 44.5 27.4468 44.5 23C44.5 11.1259 34.8741 1.5 23 1.5C11.1259 1.5 1.50002 11.1259 1.5 23C1.49999 27.6044 3.59699 31.9484 6.17145 35.7691C8.18196 38.7529 10.5873 41.5592 12.683 44.0042C13.268 44.6868 13.8289 45.3412 14.3503 45.9634C16.8748 48.976 18.7257 51.4444 19.9415 53.1533C20.5494 54.0077 20.9985 54.6721 21.2935 55.1196C21.441 55.3433 21.55 55.5128 21.6211 55.6246C21.6566 55.6805 21.6827 55.7221 21.6993 55.7487L21.7172 55.7776L21.7209 55.7836L21.7211 55.7839L24.272 55.795ZM24.272 55.795C24.2719 55.7951 24.2719 55.7952 24.2719 55.7952M24.272 55.795L24.2719 55.7952M24.2717 55.7954C24.2718 55.7954 24.2718 55.7953 24.2719 55.7952M24.2717 55.7954L24.2719 55.7952" stroke="white" stroke-opacity="0.4" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="23" cy="23" r="12" fill="white"/>' +
      '</svg>' +
      '</div>';

    const clusterSVG =
      '<div class="cluster_custom"><span>$[properties.geoObjects.length]</span>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">' +
      '<defs><style>.cls-cluster, .cls-cluster3 {fill: #fff;}.cls-cluster {opacity: 0.5;}.cls-cluster2 {fill: #16A773;}</style></defs>' +
      '<circle class="cls-cluster" cx="28" cy="28" r="28"/>' +
      '<circle data-name="Ellipse 275 copy 2" class="cls-cluster2" cx="28" cy="28" r="25"/>' +
      '<circle data-name="Ellipse 276 copy" class="cls-cluster3" cx="28" cy="28" r="18"/>' +
      '</svg>' +
      '</div>';

    const clusterer = new ymaps.Clusterer({
      clusterIcons,
      clusterIconContentLayout: ymaps.templateLayoutFactory.createClass(clusterSVG),
    });

    const geoObjects = [];

    for (let i = 0, len = points.length; i < len; i++) {
      if (!points[i] || !points[i].length) continue;
      const $balloonItem = $component.find('[data-balloon_item="' + itemIds[i] + '"]');

      geoObjects.push(
        new ymaps.Placemark(
          points[i],
          { balloonContent: $balloonItem.html() },
          {
            iconLayout: ymaps.templateLayoutFactory.createClass(markerSVG),
            iconShape: { type: 'Rectangle', coordinates: [[-23, -58], [23, 0]] },
            balloonMaxWidth: $(window).width() < 576 ? 255 : 450,
          }
        )
      );
      geoObjects[geoObjects.length - 1].events.add('click', function () {
        $component.find('[data-list_item="' + itemIds[i] + '"]').trigger('click', [!!$balloonItem.length]);
      });
    }

    clusterer.add(geoObjects);
    map.geoObjects.add(clusterer);
    map.behaviors.disable('scrollZoom');

    if (points.length) {
      map.setBounds(clusterer.getBounds(), { checkZoomRange: true });
    }
  }

  function closeBalloons11_1(objects) {
    $.each(objects, function (i, object) {
      if (object.balloon.isOpen()) object.balloon.close();
    });
  }
});
