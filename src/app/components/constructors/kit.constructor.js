(function() {
  'use strict';

  angular.module('app.components')
    .factory('Kit', ['Sensor', function(Sensor) {

      function Kit(object) {
        console.log('object', object);
        this.name = object.name;
        this.type = parseKitType(object);
        this.version = parseKitVersion(object);
        this.lastTime = moment(parseKitTime(object)).fromNow(); 
        this.location = parseKitLocation(object);
        this.labels = parseKitLabels(object); 
        this.class = classify(parseKitType(object)); 
        this.id = object.id;
        this.description = object.description;
        this.owner = parseKitOwner(object);
        this.data = object.data.sensors;
      }

      Kit.prototype.getSensors = function(options) {
        var parsedSensors = this.data.map(function(sensor) {
          return new Sensor(sensor); 
        });
        
        if(options.type === 'compare') {
          parsedSensors.unshift({
            name: 'NONE',
            color: 'white',
            id: -1
          });
        } 

        /*return parsedSensors.filter(function(sensor) {
          return sensor; 
        });*/
        return parsedSensors;
      };

      return Kit;
    }]);

    /**
     * Util functions to parse kit data. List: 
     * -parseKit
     * -parseKitLocation
     * -parseKitLabels
     * -parseKitType
     * -classify
     * -parseKitTime
     * -parseKitVersion
     */

    function parseKit(object) {
      /*jshint camelcase: false */
      var parsedKit = {
        kitName: object.name,
        kitType: parseKitType(object),  
        kitLastTime: moment(parseKitTime(object)).fromNow(), 
        kitLocation: parseKitLocation(object), 
        kitLabels: parseKitLabels(object),
        kitClass: classify(parseKitType(object))      
      };
      return parsedKit;
    }

    function parseKitLocation(object) {
      var location = '';
      
      var city = object.data.location.city;
      var country = object.data.location.country;

      if(!!city) {
        location += city;
      }
      if(!!country) {
        location += ', ' + country;
      }

      return location;
    }

    function parseKitLabels(object) {
      return {
        status: object.status,
        exposure: object.data.location.exposure
      };
    }

    function parseKitType(object) {
      var kitType; 

      if((new RegExp('sck', 'i')).test(object.kit.name)) { 
        kitType = 'SmartCitizen Kit';
      }
      return kitType; 
    }

    function classify(kitType) {
      if(!kitType) {
        return '';
      }
      return kitType.toLowerCase().split(' ').join('_');
    }

    function parseKitTime(object) {
      return object.updated_at;
    }

    function parseKitVersion(object) {
      return object.kit.name.match(/[0-9]+.?[0-9]*/)[0];
    }

    function parseKitOwner(object) {
      return {
        username: object.owner.username,
        kits: object.owner.device_ids,
        location: object.owner.location.city && object.owner.location.country ? object.owner.location.city + ', ' + object.owner.location.country : 'Barcelona, Spain',
        url: object.owner.url || 'example.com',
        avatar: object.owner.avatar || './assets/images/avatar.svg'
      };
    }

    function getKits() {

    }

    function parseSensorTime(sensor) {
      return moment(sensor.recorded_at).format('');
    }

    function convertTime(time) {
      return moment(time).format('YYYY-MM-DDThh:mm:ss') + 'Z';
    }
})();
