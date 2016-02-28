'use strict';

import request from 'request-promise';
import invariant from './invariant';
import {readFile, parseIntoLines} from './fileReader';

const BASE_URL = 'https://slack.com/api';
const rpcResponseHandler = response => {
  if (response.ok) {
    return response;
  }
  throw response.error;
}

const toChannelString = (channel, user) => {
  var targets = [];
  if (channel) {
    targets.push(`#${channel}`);
  }
  if (user) {
    targets.push(`@${user}`);
  }
  return targets.join(',');
}

const fileUploadPayload = (channels, filename, file, token) => ({
  content: file,
  title: filename,
  filename,
  channels,
  token
});

export function uploadFile (token, filename, channel, user, message, lines, onComplete = () => {}) {
  var file = readFile(filename);

  if (lines && lines.length > 1) {
    invariant(
      lines[1] > lines[0],
      'Invalid lines'
    );
    file = parseIntoLines(file, lines[0], lines[1]);
  }

  var formData = fileUploadPayload(
    toChannelString(channel, user),
    filename,
    file,
    token
  );

  return request.post({
    url: `${BASE_URL}/files.upload`,
    formData
  })
  .then(JSON.parse)
  .then(rpcResponseHandler)
  .then(response => response.file);
}

export function attachCommentToFile (token, file, comment, onComplete = () => {}) {
  var formData = {
    token,
    file,
    comment
  };
  request.post({
    url: `${BASE_URL}/files.comments.add`,
    formData
  })
  .then(JSON.parse)
  .then(rpcResponseHandler)
  .then(response => response.comment);
}
