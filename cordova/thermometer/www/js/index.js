var THERMOMETER_SERVICE = 'BBB0';
var TEMPERATURE_CHARACTERISTIC = 'BBB1';

var app = {
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        deviceList.addEventListener('click', this.connect, false);
        refreshButton.addEventListener('click', this.refreshDeviceList, false);
        disconnectButton.addEventListener('click', this.disconnect, false);

    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empty the list
        ble.scan([THERMOMETER_SERVICE], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
       var listItem = document.createElement('li');
       listItem.innerHTML = device.name + '<br/>' + device.id;
       listItem.dataset.deviceId = device.id;
       deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId;
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(peripheral) {
        app.peripheral = peripheral;
        app.showDetailPage();

        var failure = function(reason) {
           navigator.notification.alert(reason, null, "Temperature Error");
        };

        // subscribe to be notified when the button state changes
        ble.startNotification(
            peripheral.id,
            THERMOMETER_SERVICE,
            TEMPERATURE_CHARACTERISTIC,
            app.onTemperatureChange,
            failure
        );

        // read the initial value
        ble.read(
            peripheral.id,
            THERMOMETER_SERVICE,
            TEMPERATURE_CHARACTERISTIC,
            app.onTemperatureChange,
            failure
        );

    },
    onTemperatureChange: function(buffer) {
        var data = new Float32Array(buffer);
        var celsius = data[0];
        var fahrenheit = (celsius * 1.8 + 32.0).toFixed(1);
        //var message = "Temperature is " + fahrenheit + " &deg;F";        
        var message = fahrenheit + " &deg;F<br/>" +  
                    celsius.toFixed(1) + " &deg;C";
        statusDiv.innerHTML = message;
    },
    disconnect: function(e) {
        if (app.peripheral && app.peripheral.id) {
            ble.disconnect(app.peripheral.id, app.showMainPage, app.onError);
        }
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
       navigator.notification.alert(reason, app.showMainPage, "Error");
    }
};
