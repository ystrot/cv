var timeline;
var now;

function init() {
  var date = new Date();
  now = new Time(date.getDate()  + "." + (date.getMonth() + 1) + "." + date.getFullYear());

  timeline = new Timeline();
  timeline.add(new Event("School", "green", "01.97 - 01.06.03"));
  timeline.add(new Event("IT College", "green", "10.00 - 01.01, 03.01 - 06.01"));
  timeline.add(new Event("University", "green", "09.03 - 06.09"));

  timeline.add(new Event("Xored", "red", "07.06 - 04.12"));
  timeline.add(new Event("Speaktoit", "red", "06.12 - "));
}

function sync() {
  var w = $(window).width();
  var h = $(window).height();

  $("#timeline").attr("width", (w - 2) + "px");
  $("#timeline").attr("height", (h - 100) + "px");

  timeline.fill(w - 10);
}

function Event(name, color, schedule) {
  this.name = name;
  this.color = color;
  this.times = eventParseSchedule(schedule);
}

Event.prototype.start = function() {
  return this.times[0].start;
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
  var start = 30;
  for(var i = 0; i < this.events.length; i++) {
    this.drawEvent(this.events[i], start + i * 20);
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