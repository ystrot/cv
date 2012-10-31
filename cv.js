var timeline;
var skills;
var now;
var startTime;

function init() {
  var date = new Date();
  now = new Time(date.getDate()  + "." + (date.getMonth() + 1) + "." + date.getFullYear());

  timeline = new Timeline();
  timeline.add(new Event("School", "green", "01.97 - 01.06.03"));
  timeline.add(new Event("IT College", "green", "10.00 - 01.01, 03.01 - 06.01"));
  timeline.add(new Event("University", "green", "09.03 - 06.09"));

  timeline.add(new Event("Xored", "red", "07.06 - 04.12"));
  timeline.add(new Event("Speaktoit", "red", "06.12 - "));

  skills = new Skills();
  startTime = new Date().getTime();
}

function sync() {
  var w = $(window).width();
  var h = $(window).height();

  $("#timeline").attr("width", (w - 2) + "px");
  $("#timeline").attr("height", (h - 100) + "px");

  timeline.fill(w - 10);
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

function Event(name, color, schedule) {
  this.name = name;
  this.color = color;
  this.times = eventParseSchedule(schedule);
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
}

Timeline.prototype.fill = function(width) {
  this.width = width;
  this.g.font = "12px sans-serif";
  this.g.textBaseline = "top";
  this.drawYears();
  this.drawEvents();
}

Timeline.prototype.drawYears = function() {
  this.initYear = this.events[0].start().year;
  var thisYear = now.year;
  this.yearSize = this.width / (thisYear - this.initYear + 1);

  for(var i = this.initYear; i <= thisYear; i++) {
    this.drawYear(i, 5 + (i - this.initYear) * this.yearSize, this.yearSize);
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
  var shift = (time.year - this.initYear + (time.month - 1) / 12 + (time.day - 1) / 365) * this.yearSize;
  return Math.round(shift) + 5;
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