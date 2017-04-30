var mongoose = require('mongoose'),
  Schema = mongoose.Schema; 


var weekStat = new Schema({
  startDate: Date,
  endDate: Date, //used only with
  subscriptions: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }, //total amount of money recieved
  rating: {
    type: Number,
    default: 0
  },
  attendees: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  business:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'business'
  }
});

var monthStat = new Schema({
  month: Number,
  year: Number,
  subscriptions: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }, //total amount of money recieved
  rating: {
    type: Number,
    default: 0
  },
  attendees: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  business:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'business'
  }
});

var yearStat = new Schema({
  year: Number,
  subscriptions: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }, //total amount of money recieved
  rating: {
    type: Number,
    default: 0
  },
  attendees: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  business:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'business'
  }
});

var allStat = new Schema({
  subscriptions: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }, //total amount of money recieved
  rating: {
    type: Number,
    default: 0
  },
  attendees: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }, business:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'business'
  }
});

var WeekStat = mongoose.model('WeekStat', weekStat);
var MonthStat = mongoose.model('MonthStat', monthStat);
var YearStat = mongoose.model('YearStat', yearStat);
var AllStat = mongoose.model('AllStat', allStat);
module.exports = {
  WeekStat: WeekStat,
  MonthStat: MonthStat,
  YearStat: YearStat,
  AllStat: AllStat

};
