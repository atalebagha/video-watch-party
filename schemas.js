const { Schema, model } = require('mongoose');
const uuid = require('uuid');

const UserSchema = new Schema({
  id: {
    type: String,
    default: uuid.v4,
  },
  name: {
    type: String,
    unique: true,
  },
  online: Boolean
}, { timestamps: true });


const SessionSchema = new Schema({
  id: {
    type: String,
  },
  url: String,

}, { timestamps: true });

const SessionEventSchema = new Schema({
  id: {
    type: String,
    default: uuid.v4,
  },
  sessionId: {
    type: String,
  },
  payload: {},
  username: String,
  event: {
    enum: [
      'SET_URL',
      'PLAY',
      'PAUSE',
      'SEEK',
      'JOIN',
      'LEAVE',
      'END',
      'PROGRESS'
    ]
  }
}, { timestamps: true });

exports.User = model('User', UserSchema, 'users');
exports.Session = model('Session', SessionSchema, 'sessions');
exports.SessionEvent = model('SessionEvent', SessionEventSchema, 'sessionEvents');

