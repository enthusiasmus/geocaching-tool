$(document).ready(function () {
  $("#text").on("input", lettersToNumbers.start.bind(lettersToNumbers));
  $("input[type=radio]").on("change", lettersToNumbers.start.bind(lettersToNumbers));
  lettersToNumbers.start();

  $("#coordinatesConverter input").on("input", coordinatesConverter.start.bind(coordinatesConverter));
  coordinatesConverter.start();

  map = new OpenLayers.Map("map");
  map.addLayer(new OpenLayers.Layer.OSM());
  map.zoomToMaxExtent();

  map.events.register("mouseup", map, function (e) {
    var position = map.getLonLatFromPixel(this.events.getMousePosition(e)).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
    OpenLayers.Util.getElement("coordinatesMap").innerHTML = "<label>Latitude: " + position.lat + "</label><br/><label>Longitude: " + position.lon + "</label>";
  });

  $(".menuItem").click(function (event) {
    if (event.currentTarget.id === "menuLetters") {
      $("#coordinatesConverter").hide();
      $("#coordinatesFromMap").hide();
      $("#letterNumberCalculator").show();
    } else if (event.currentTarget.id === "menuCoordinates") {
      $("#coordinatesConverter").show();
      $("#coordinatesFromMap").show();
      $("#letterNumberCalculator").hide();
    }
  });

  $("#coordinatesConverter").hide();
  $("#coordinatesFromMap").hide();
  $("#letterNumberCalculator").show();
});

var coordinatesConverter = {
  //+/-90.00000° latitude +/-180.00000° longitude
  degrees: {
    lat: ""/*47.798642*/,
    lng: ""/*13.045515*/,
    text: ""
  },
  //N/S 90° 0-59.999 latitude E/W 180° 0-59.999 longitude
  degreesArcMinutes: {
    lat: {
      degrees: 47,
      arcMinutes: 47.918
    },
    lng: {
      degrees: 13,
      arcMinutes: 2.730
    }
  },
  //N/S 90° 0-59' 0-59.999" latitude E/W 180° 0-59' 0-59.999" longitude
  degreesArcMinutesArcSeconds: {
    lat: {
      degrees: 47,
      arcMinutes: 47,
      arcSeconds: 55.111
    },
    lng: {
      degrees: 13,
      arcMinutes: 2,
      arcSeconds: 43.854
    }
  },
  start: function (event) {
    if (!event) {
      this.reset();
      return;
    }

    if (event.currentTarget.id === "degrees") {
      this.formatDegrees(event.currentTarget.value);
      this.degreesToDegreesArcMinutes();
      this.printDegreesArcMinutes();
      this.degreesArcMinutesToDegreesArcMinutesArcSeconds();
      this.printDegreesArcMinutesArcSeconds();
    }
    else if (event.currentTarget.id === "degreesArcMinutes") {
      this.formatDegreesArcMinutes(event.currentTarget.value);
      this.degreesArcMinutesToDegrees();
      this.printDegrees();
      this.degreesArcMinutesToDegreesArcMinutesArcSeconds();
      this.printDegreesArcMinutesArcSeconds();
    }
    else if (event.currentTarget.id === "degreesArcMinutesArcSeconds") {
      this.formatDegreesArcMinutesArcSeconds(event.currentTarget.value);
      this.degreesArcMinutesArcSecondsToDegreesArcMinutes();
      this.printDegreesArcMinutes();
      this.degreesArcMinutesToDegrees();
      this.printDegrees();
    }

    //this.print();
  },
  formatDegrees: function (degrees) {
    degrees = degrees.trim();
    degrees = degrees.replace(/\,/g, ".");
    degrees = degrees.replace(/([a-z])([A-Z])/g, "")
    degrees = degrees.split(" ");

    this.degrees.lat = 0;
    this.degrees.lng = 0;

    if (degrees.length !== 2) {
      return;
    }
    else if (typeof parseFloat(degrees[0]) !== "number" || typeof parseFloat(degrees[1]) !== "number") {
      return;
    }

    if (degrees[0].slice(degrees[0].length - 1) === ".") {
      degrees[0] = degrees[0].slice(0, degrees[0].length - 1)
    }

    if (degrees[0] < -90 || degrees[0] > 90 || degrees[1] < -180 || degrees[1] > 180) {
      return;
    }

    this.degrees.lat = Math.floor(parseFloat(degrees[0] * 1000000)) / 1000000;
    this.degrees.lng = Math.floor(parseFloat(degrees[1] * 1000000)) / 1000000;
  },
  formatDegreesArcMinutes: function (degrees) {
    degrees = degrees.trim();
    degrees = degrees.replace(/\,/g, ".");
    degrees = degrees.split(" ");

    this.degreesArcMinutes.lat.degrees = 0;
    this.degreesArcMinutes.lat.arcMinutes = 0;
    this.degreesArcMinutes.lng.degrees = 0;
    this.degreesArcMinutes.lng.arcMinutes = 0;

    if (degrees.length !== 4) {
      return;
    }

    if (degrees[0][0] === "N" || degrees[0][0] === "S") {
      degrees[0] = degrees[0].slice(1);
    }
    if (degrees[2][0] === "E" || degrees[2][0] === "W") {
      degrees[2] = degrees[2].slice(1);
    }

    if (degrees[0][degrees[0].length - 1] === "°") {
      degrees[0] = degrees[0].slice(0, degrees[0].length - 1);
    }
    if (degrees[2][degrees[2].length - 1] === "°") {
      degrees[2] = degrees[2].slice(0, degrees[2].length - 1);
    }

    if (degrees[0] < -90 || degrees[0] > 90 ||
      degrees[1] < 0 || degrees[1] > 60 ||
      degrees[2] < -180 || degrees[2] > 180 ||
      degrees[3] < 0 || degrees[1] > 60) {
      return;
    }

    this.degreesArcMinutes.lat.degrees = parseFloat(degrees[0]);
    this.degreesArcMinutes.lat.arcMinutes = parseFloat(degrees[1]);
    this.degreesArcMinutes.lng.degrees = parseFloat(degrees[2]);
    this.degreesArcMinutes.lng.arcMinutes = parseFloat(degrees[3]);
  },
  formatDegreesArcMinutesArcSeconds: function () {

  },
  reset: function () {
    $("#degrees").val("");
    $("#degreesArcMinutes").val("");
    $("#degreesArcMinutesArcSeconds").val("");
  },
  degreesToDegreesArcMinutes: function () {
    this.degreesArcMinutes.lat.degrees = Math.abs(~~this.degrees.lat);
    this.degreesArcMinutes.lng.degrees = Math.abs(~~this.degrees.lng);

    this.degreesArcMinutes.lat.arcMinutes = (this.degrees.lat - Math.abs(~~this.degrees.lat)) * 60;
    this.degreesArcMinutes.lng.arcMinutes = (this.degrees.lng - Math.abs(~~this.degrees.lng)) * 60;

    this.degreesArcMinutes.lat.arcMinutes = Math.floor(parseFloat(this.degreesArcMinutes.lat.arcMinutes * 1000)) / 1000;
    this.degreesArcMinutes.lng.arcMinutes = Math.floor(parseFloat(this.degreesArcMinutes.lng.arcMinutes * 1000)) / 1000;
  },
  degreesArcMinutesToDegrees: function () {
    this.degrees.lat = this.degreesArcMinutes.lat.degrees + this.degreesArcMinutes.lat.arcMinutes / 60;
    this.degrees.lng = this.degreesArcMinutes.lng.degrees + this.degreesArcMinutes.lng.arcMinutes / 60;
  },
  degreesArcMinutesToDegreesArcMinutesArcSeconds: function () {
    //TODO: Bogensekunden stimmen nicht ganz
    this.degreesArcMinutesArcSeconds.lat.degrees = this.degreesArcMinutes.lat.degrees;
    this.degreesArcMinutesArcSeconds.lng.degrees = this.degreesArcMinutes.lng.degrees;

    this.degreesArcMinutesArcSeconds.lat.arcMinutes = Math.abs(~~this.degreesArcMinutes.lat.arcMinutes);
    this.degreesArcMinutesArcSeconds.lng.arcMinutes = Math.abs(~~this.degreesArcMinutes.lng.arcMinutes);

    this.degreesArcMinutesArcSeconds.lat.arcSeconds = (this.degreesArcMinutes.lat.arcMinutes - Math.abs(~~this.degreesArcMinutes.lat.arcMinutes)) * 60;
    this.degreesArcMinutesArcSeconds.lng.arcSeconds = (this.degreesArcMinutes.lng.arcMinutes - Math.abs(~~this.degreesArcMinutes.lng.arcMinutes)) * 60;

    this.degreesArcMinutesArcSeconds.lat.arcSeconds = Math.floor(parseFloat(this.degreesArcMinutesArcSeconds.lat.arcSeconds * 1000)) / 1000;
    this.degreesArcMinutesArcSeconds.lng.arcSeconds = Math.floor(parseFloat(this.degreesArcMinutesArcSeconds.lng.arcSeconds * 1000)) / 1000;
  },
  degreesArcMinutesArcSecondsToDegreesArcMinutes: function () {
    this.degreesArcMinutes.lat.degrees = this.degreesArcMinutesArcSeconds.lat.degrees;
    this.degreesArcMinutes.lng.degrees = this.degreesArcMinutesArcSeconds.lng.degrees;

    this.degreesArcMinutes.lat.arcMinutes = this.degreesArcMinutesArcSeconds.lat.arcMinutes + this.degreesArcMinutesArcSeconds.lat.arcSeconds / 60;
    this.degreesArcMinutes.lng.arcMinutes = this.degreesArcMinutesArcSeconds.lng.arcMinutes + this.degreesArcMinutesArcSeconds.lng.arcSeconds / 60;
  },
  printDegrees: function () {
    $("#degrees").val(this.degrees.lat + " " + this.degrees.lng);
  },
  printDegreesArcMinutes: function () {
    var latitude = "", longitude = "";
    if (this.degrees.lat >= 0) {
      latitude = "N";
    }
    else if (this.degrees.lat < 0) {
      latitude = "S";
    }

    if (this.degrees.lng < 0) {
      longitude = "W";
    }
    else if (this.degrees.lng >= 0) {
      longitude = "E";
    }

    var degreesArcMinutes = latitude + Math.abs(this.degreesArcMinutes.lat.degrees) + "° "
      + this.degreesArcMinutes.lat.arcMinutes + " " + longitude + Math.abs(this.degreesArcMinutes.lng.degrees) + "° "
      + this.degreesArcMinutes.lng.arcMinutes;
    $("#degreesArcMinutes").val(degreesArcMinutes);
  },
  printDegreesArcMinutesArcSeconds: function () {
    var latitude = "", longitude = "";
    if (this.degrees.lat >= 0) {
      latitude = "N";
    }
    else if (this.degrees.lat < 0) {
      latitude = "S";
    }

    if (this.degrees.lng < 0) {
      longitude = "W";
    }
    else if (this.degrees.lng >= 0) {
      longitude = "E";
    }

    var degreesArcMinutesArcSeconds = latitude + Math.abs(this.degreesArcMinutesArcSeconds.lat.degrees) + "° "
      + this.degreesArcMinutesArcSeconds.lat.arcMinutes + "' " + this.degreesArcMinutesArcSeconds.lat.arcSeconds
      + "\"" + " " + longitude + Math.abs(this.degreesArcMinutesArcSeconds.lng.degrees) + "° "
      + this.degreesArcMinutesArcSeconds.lng.arcMinutes + "' " + this.degreesArcMinutesArcSeconds.lng.arcSeconds + "\"";
    $("#degreesArcMinutesArcSeconds").val(degreesArcMinutesArcSeconds);
  }
}

var lettersToNumbers = {
  type: null,
  text: null,
  numbers: null,
  start: function (event) {
    this.type = $("input[name='calculateType']:checked").val();
    var text = $("#text").val();
    this.iterateText(text);
    if (this.numbers.length < 1) {
      $("#letterNumberCalculator .addition").text("Addition: 0");
      $("#letterNumberCalculator .subtraction").text("Subtraktion: 0");
      $("#letterNumberCalculator .multiplication").text("Multiplikation: 0");
      $("#letterNumberCalculator .division").text("Division: 0");
      $("#letterNumberCalculator .oneDigitCrossSum").text("Einstellige Quersumme: 0");
      return;
    }

    this.addition();
    this.subtraction();
    this.multiplication();
    this.division();
    this.oneDigitCrossSum(this.numbers);
  },
  iterateText: function (text) {
    var textArray = text.split("");
    var decodedArray = new Array();
    this.numbers = new Array();
    textArray.forEach(function (element, index, array) {
      var string = element;
      switch (element.charCodeAt()) {
        case 228:
          string = "ae";
          break;
        case 196:
          string = "Ae";
          break;
        case 246:
          string = "oe";
          break;
        case 214:
          string = "Oe";
          break;
        case 252:
          string = "ue";
          break;
        case 220:
          string = "Ue";
          break;
        case 223:
          string = "ss";
          break;
      }

      string.split("").forEach(function (element) {
        var charCode = element.charCodeAt();
        if (charCode > 64 && charCode < 91 || charCode > 96 && charCode < 123 || charCode > 47 && charCode < 58) {
          decodedArray.push(element);
          lettersToNumbers.numbers.push(lettersToNumbers.getNumberFromChar(element));
        }
      });
    });
    this.text = decodedArray.join("");
  },
  addition: function () {
    var value = 0;
    $("#letterNumberCalculator .addition").text("Addition: ");
    this.numbers.forEach(function (element, index, array) {
      value += element;
      $("#letterNumberCalculator .addition").append(" + " + element);
    });
    $("#letterNumberCalculator .addition").append(" = " + value);
  },
  subtraction: function () {
    var value = 0;
    $("#letterNumberCalculator .subtraction").text("Subtraktion: ");
    this.numbers.forEach(function (element, index, array) {
      value -= element;
      $("#letterNumberCalculator .subtraction").append(" - " + element);
    });
    $("#letterNumberCalculator .subtraction").append(" = " + value);
  },
  multiplication: function () {
    var value = 1;
    $("#letterNumberCalculator .multiplication").text("Multiplikation: ");
    this.numbers.forEach(function (element, index, array) {
      value *= element;

      if (index < array.length - 1) {
        $("#letterNumberCalculator .multiplication").append(element + " * ");
      }
      else {
        $("#letterNumberCalculator .multiplication").append(element);
      }
    });
    $("#letterNumberCalculator .multiplication").append(" = " + value);
  },
  division: function () {
    var value = this.numbers[0];
    $("#letterNumberCalculator .division").text("Division: " + value);
    this.numbers.slice(1).forEach(function (element, index, array) {
      value /= element;
      $("#letterNumberCalculator .division").append(" / " + element);
    });

    if (isFinite(value)) {
      $("#letterNumberCalculator .division").append(" = " + value);
    }
    else {
      $("#letterNumberCalculator .division").append(" = &#8734;");
    }
  },
  oneDigitCrossSum: function (numbers) {
    var value = 0;
    numbers.forEach(function (element, index, array) {
      value += ~~element; //bitwise not - to get integer
    });

    if (value > 9) {
      this.oneDigitCrossSum(value.toString().split(""));
    }
    else {
      $("#letterNumberCalculator .oneDigitCrossSum").text("Einstellige Quersumme: " + value);
    }
  },
  getNumberFromChar: function (char) {
    var number = 0;
    var charCode = char.charCodeAt();

    if (charCode > 64 && charCode < 91) {
      switch (this.type) {
        case "a1z26":
          number = charCode - 64;
          break;
        case "a0z25":
          number = charCode - 65;
          break;
        case "a26z1":
          number = charCode - 65;
          number = 26 - number;
          break;
        case "a25z0":
          number = charCode - 64;
          number = 26 - number;
          break;
      }
    }
    else if (charCode > 96 && charCode < 123) {
      switch (this.type) {
        case "a1z26":
          number = charCode - 96;
          break;
        case "a0z25":
          number = charCode - 97;
          break;
        case "a26z1":
          number = charCode - 97;
          number = 26 - number;
          break;
        case "a25z0":
          number = charCode - 96;
          number = 26 - number;
          break;
      }
    }
    else if (charCode > 47 && charCode < 58) {
      number = char;
    }

    return ~~number;
  }
}