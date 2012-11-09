var timeline;
var skills;
var now;
var startTime;

function init() {
  var date = new Date();
  now = new Time(date.getDate()  + "." + (date.getMonth() + 1) + "." + date.getFullYear());

  timeline = new Timeline();
  timeline.add(new Event("School", "green", "01.99 - 01.06.03"));
  timeline.add(new Event("IT College", "green", "10.00 - 01.01, 03.01 - 06.01", "img/college.png"));
  timeline.add(new Event("University", "green", "09.03 - 06.09", "img/nsu.png"));

  timeline.add(new Event("SWSoft", "red", "06.05 - 10.05", "img/swsoft.png -> img/parallels.png"));
  timeline.add(new Event("Xored", "red", "07.06 - 04.12", "img/xored.png"));
  timeline.add(new Event("Speaktoit", "red", "06.12 - ", "img/speaktoit.png"));

  skills = new Skills();
  startTime = new Date().getTime();
}

function sync() {
  var w = $(window).width();
  var h = $(document).height();

  $("#timeline").attr("width", w + "px");
  $("#timeline").attr("height", (h - 100) + "px");

  timeline.fill(w);

  drawLogo("img/cisco.png", 800, 55, 75);
  drawLogo("img/bt.png", 930, 55, 75);
  drawLogo("img/instantiations.png", 1060, 70, 75);
  drawLogo("img/google.png", 1200, 70, 75);
  drawLogo("img/keytec.png", 1320, 70);
  drawLogo("img/farata.png", 1500, 70);
}

function update() {
  var curTime = new Date().getTime();
  var delta = new Date().getTime() - startTime;
  if (delta > 15000) {
    return;
  }
  var v1 = delta + 1000;
  var v2 = delta / 2 + 100;
  skills.fillValues(v1, v2, "purple", "orange");
  setTimeout(update, 10);
}

function drawLogo(src, x, y) {
  var image = new Image();
  image.onload = function() {
    var g = document.getElementById("timeline").getContext("2d");
    var w = image.width;
    var h = image.height;
    if (w <= 75 && h <= 35) {
      g.drawImage(image, x, y);
    } else {
      var wr = w / 75;
      var hr = h / 35;
      var r = Math.max(wr, hr);
      g.drawImage(image, 0, 0, w, h, x, y, w / r, h / r);
    }
  };
  image.src = src;
}

function Event(name, color, schedule, logo) {
  this.timeline = null;
  this.name = name;
  this.color = color;
  this.times = eventParseSchedule(schedule);
  if (logo !== undefined) {
    var e = this;
    var refresh = function() { if (e.timeline != null) e.timeline.fill(); }
    var logoSrc = logo;
    if (logoSrc.indexOf("->") > 0) {
      var parts = logoSrc.split("->");
      logoSrc = $.trim(parts[0]);

      this.logo2 = new Image();
      this.logo2.onload = refresh;
      this.logo2.src = $.trim(parts[1]);
    }
    this.logo = new Image();
    this.logo.onload = refresh;
    this.logo.src = logoSrc;
  } else {
    this.logo = null;
  }
}

Event.prototype.start = function() {
  return this.times[0].start;
}

Event.prototype.end = function() {
  return this.times[this.times.length - 1].end;
}

function eventParseSchedule(text) {
  var ranges = text.split(",");
  var result = [];
  for(var i = 0; i < ranges.length; i++) {
    result.push(new TimeRange(ranges[i]));
  }
  return result;
}

function TimeRange(text) {
  text = $.trim(text);
  var index = text.indexOf("-");
  if (index < 0) {
    this.start = new Time(text);
    this.end = null;
  } else {
    this.start = new Time(text.slice(0, index));
    this.end = new Time(text.slice(index + 1));
  }
}

function Time(str) {
  str = $.trim(str);
  if (str.length == 0) {
    this.year = now.year;
    this.month = now.month;
    this.day = now.day;
  } else {
    var parts = str.split(".");
    if (parts.length > 2) {
      this.year = fixYear(parseTimeInt(parts[2]));
      this.month = parseTimeInt(parts[1]);
      this.day = parseTimeInt(parts[0]);
    } else {
      this.year = fixYear(parseTimeInt(parts[1]));
      this.month = parseTimeInt(parts[0]);
      this.day = 15;
    }
  }
}

Time.prototype.isLess = function(time) {
  var diff = this.year - time.year;
  if (diff == 0) {
    diff = this.month - time.month;
    if (diff == 0) {
      diff = this.day - time.day;
    }
  }
  return diff < 0;
}

function fixYear(year) {
  if (year >= 1000) return year;
  return year < 50 ? year + 2000 : year + 1900;
}

function parseTimeInt(str) {
  var index = 0;
  while(index < str.length && str.charAt(index) == "0") index++;
  if (index == str.length) return 0;
  str = str.slice(index);
  return parseInt(str);
}

function Timeline() {
  this.g = document.getElementById("timeline").getContext("2d");
  this.events = [];
  this.width = 0;
}

Timeline.prototype.add = function(e) {
  this.events.push(e);
  e.timeline = this;
}

Timeline.prototype.start = function(e) {
  return this.events[0].start();
}

Timeline.prototype.fill = function(width) {
  if (width !== undefined) this.width = width;
  this.g.font = "12px sans-serif";
  this.g.textBaseline = "top";
  this.drawYears();
  this.drawEvents();
}

Timeline.prototype.drawYears = function() {
  var initYear = this.start().year;
  var thisYear = now.year;
  var yearCount = thisYear - initYear + 1;

  if (!this.yearsRatio) {
    this.yearsRatio = [];
    var middle = yearCount / 2;
    var part = 0.25;
    for(var i = 0; i < middle; i++) {
      this.yearsRatio.push(part * i / middle);
    }
    for(var i = middle; i < yearCount; i++) {
      this.yearsRatio.push(part + (1 - part) * (i - middle) / (yearCount - middle));
    }
    this.yearsRatio.push(1);
  }

  for(var i = initYear; i <= thisYear; i++) {
    var index = i - initYear;
    var shift = this.width * this.yearsRatio[index];
    var size = this.width * this.yearsRatio[index + 1] - shift;
    this.drawYear(i, shift, size);
  }
}

Timeline.prototype.drawEvents = function() {
  var limits = [];
  var maxLimit = 0;
  for(var i = 0; i < this.events.length; i++) {
    var event = this.events[i];
    var curLimit = -1;
    for(var j = 0; j < maxLimit; j++) {
      if (limits[j].isLess(event.start())) {
        curLimit = j;
        limits[j] = event.end();
        break;
      }
    }
    if (curLimit < 0) {
      curLimit = maxLimit;
      maxLimit++;
      limits.push(event.end());
    }
    this.drawEvent(event, 30 + curLimit * 20);
  }
}

Timeline.prototype.drawYear = function(year, shift, size) {
  var header = 16;
  var content = 100;
  var even = year % 2 == 0;

  this.g.fillStyle = even ? "#acacac" : "#888888";
  this.g.fillRect(shift, 0, size, header);

  this.g.fillStyle = even ? "#f3f3f3" : "#dbdbdb";
  this.g.fillRect(shift, header, size, content);

  year = year % 100;
  var text = (year < 10 ? "0" : "") + year;
  var width = this.g.measureText(text).width;
  var textShift = (size - width) / 2;

  if (textShift < 2) {
    text = "" + (year % 10);
    width = this.g.measureText(text).width;
  }

  this.g.fillStyle = "white";
  this.g.fillText(text, shift + (size - width) / 2, 2);
}

Timeline.prototype.drawEvent = function(event, y) {
  var pin = 2;

  for(var i = 0; i < event.times.length; i++) {
    var time = event.times[i];
    var start = this.timeToPos(time.start);
    var end = this.timeToPos(time.end);

    this.g.beginPath();
    this.g.moveTo(start, y);
    this.g.lineTo(end, y);
    this.g.strokeStyle = event.color;
    this.g.stroke();

    this.fillCircle(start, y, pin, event.color);
    this.fillCircle(end, y, pin, event.color);
  }

  if (event.logo != null) {
    var start = this.timeToPos(event.start());
    this.g.beginPath();
    this.g.moveTo(start, y);
    this.g.lineTo(start - 20, y + 20);
    this.g.lineTo(start - 5, y + 20);
    this.g.strokeStyle = event.color;
    this.g.stroke();

    var w = event.logo.width;
    var h = event.logo.height;
    var r = 1;
    if (w > 75 || h > 35) {
      r = Math.max(w / 75, h / 35);
    }
    var ex = start;
    var ey = y + 20 - h / (2 * r);

    if (event.logo2 != null) { this.g.globalAlpha = 0.3; }
    this.g.drawImage(event.logo, 0, 0, w, h, ex, ey, w / r, h / r);
    if (event.logo2 != null)
    {
      this.g.globalAlpha = 1;

      w = event.logo2.width;
      h = event.logo2.height;
      r = 1;
      if (w > 75 || h > 35) {
        r = Math.max(w / 75, h / 35);
      }
      this.g.drawImage(event.logo2, 0, 0, w, h, ex + 7, ey + 7, w / r, h / r);
    }
  }
}

Timeline.prototype.fillCircle = function(cx, cy, r, color) {
    this.g.fillStyle = color;
    this.g.beginPath();
    this.g.arc(cx, cy, r, 0, Math.PI * 2, true);
    //this.g.rect(cx, cy, r, r);
    this.g.closePath();
    this.g.fill();
}

Timeline.prototype.timeToPos = function(time) {
  var yearIndex = time.year - this.start().year;
  var shift = this.yearsRatio[yearIndex];
  var delta = (this.yearsRatio[yearIndex + 1] - shift) / 12;
  shift += (time.month - 1) * delta;
  shift += (time.day - 1) * delta / 31;
  return Math.round(shift * this.width);
}

function Skills() {
  this.g = document.getElementById("timeline").getContext("2d");
  this.x = 300;
  this.y = 300;
}

Skills.prototype.fillValues = function(v1, v2, color1, color2) {
  var v12 = v1 + v2;
  var r = Math.sqrt(v12 / Math.PI);
  var factor = 2 * Math.PI / v12;
  var topAngle = v1 * factor;
  var botAngle = v2 * factor;
  this.drawSector(this.x, this.y, r, topAngle, true, color1);
  this.drawSector(this.x, this.y, r, botAngle, false, color2);
}

Skills.prototype.drawSector = function(cx, cy, r, angle, top, color) {
  this.g.fillStyle = color;
  this.g.beginPath();
  this.g.moveTo(cx, cy);
  if (top) {
    this.g.arc(cx, cy, r, (3 * Math.PI - angle) / 2, (3 * Math.PI + angle) / 2);
  } else {
    this.g.arc(cx, cy, r, (Math.PI - angle) / 2, (Math.PI + angle) / 2);
  }
  this.g.closePath();
  this.g.fill(); // or context.fill()
}