(function() {
  'use strict';

  angular.module('app.components')
    .controller('NewKitController', NewKitController);

    NewKitController.$inject = ['$scope', 'animation', 'device', 'tag', 'alert'];
    function NewKitController($scope, animation, device, tag, alert) {
      var vm = this;

      vm.step = 1;
      vm.submitForm = submitForm;

      // FORM INFO
      vm.kitForm = {
        name: undefined,
        elevation: undefined,
        exposure: undefined,
        location: {
          lat: undefined,
          lng: undefined,
          zoom: 16
        },
        tags: []
      };

      // EXPOSURE SELECT
      vm.exposure = [
        {name: 'indoor', value: 1},
        {name: 'outdoor', value: 2}
      ];

      // TAGS SELECT
      vm.tags = [];
      $scope.$watch('vm.tag', function(newVal, oldVal) {
        if(!newVal) {
          return;
        }
        // remove selected tag from select element
        vm.tag = undefined;

        var alreadyPushed = _.some(vm.kitForm.tags, function(tag) {
          return tag.id === newVal;
        });
        if(alreadyPushed) {
          return;
        }

        var tag = _.find(vm.tags, function(tag) {
          return tag.id === newVal;
        });
        vm.kitForm.tags.push(tag);
      });
      vm.removeTag = removeTag;

      // MAP CONFIGURATION
      vm.getLocation = getLocation;
      vm.markers = {
        main: {
          lat: undefined,
          lng: undefined,
          draggable: true
        }
      };
      vm.tiles = {
        url: 'https://api.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG9tYXNkaWV6IiwiYSI6ImRTd01HSGsifQ.loQdtLNQ8GJkJl2LUzzxVg'
      };
      vm.defaults = {
        scrollWheelZoom: false
      };

      initialize();

      //////////////

      function initialize() {
        animation.viewLoaded();
        getTags();
      }

      function getLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
          $scope.$apply(function() {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            vm.kitForm.location.lat = lat;
            vm.kitForm.location.lng = lng;
            vm.markers.main.lat = lat;
            vm.markers.main.lng = lng;
          });
        });
      }

      function removeTag(tagID) {
        vm.kitForm.tags = _.filter(vm.kitForm.tags, function(tag) {
          return tag.id !== tagID;
        });
      }

      function submitForm() {
        var data = {
          name: vm.kitForm.name,
          description: vm.kitForm.description,
          exposure: findExposure(vm.kitForm.exposure),
          latitude: vm.kitForm.location.lat,
          longitude: vm.kitForm.location.lng,
          user_tags: _.pluck(vm.kitForm.tags, 'name').join(',')
        };
        debugger;
        device.createDevice(data)
          .then(
            function() {
              alert.success('Your kit was created but has not been configured');
            },
            function() {
              alert.error('There has been an error during kit set up');
            });
      }

      function getTags() {
        tag.getTags()
          .then(function(tagsData) {
            vm.tags = tagsData;
          });
      }

      //TODO: move to utils
      function findExposure(nameOrValue) {
        var findProp, resultProp;
        //if it's a string
        if(isNaN(parseInt(nameOrValue))) {
          findProp = 'name';
          resultProp = 'value';
        } else {
          findProp = 'value';
          resultProp = 'name';
        }

        var option = _.find(vm.exposure, function(exposureFromList) {
          return exposureFromList[findProp] === nameOrValue;
        });
        if(option) {
          return option[resultProp];
        }
      }
    }
})();
