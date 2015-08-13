var express = require('express');
var _ = require('underscore');

var spotify = require('../middlewares/spotify.js');
var echonest = require('../middlewares/echonest.js');
var util = require('../helpers/util');

var router = express.Router();

/**
* route for getting playlist based on user id
*/
router.get('/user/playlists', function(req,res) {
  var access_token = req.session.user.access_token;
  var target_id = req.session.user.spotifyId;

  spotify.getUserPlaylist(target_id, access_token)
  .catch(spotify.OldTokenError, function (err) {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getUserPlaylist(target_id, body.access_token);
    });
  })
  .then(function(playListArr) {
    res.json(playListArr);
  })
  .catch(function (e) {
    console.error('Got error: ',e);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

/**
* route for getting songs/tracks from playlist
*/
router.get('/user/playlist/:ownerId/:playlistId/:turntness', function(req, res) {
  var access_token = req.session.user.access_token;
  var target_ownerId = req.params.ownerId;
  var target_playlistId = req.params.playlistId;
  var target_turntness = req.params.turntness;

  spotify.getPlaylistTracks(target_ownerId, target_playlistId, access_token)
  .catch(spotify.OldTokenError, function () {
    // statusCode 401:  Unauthorized
    return spotify.refreshToken(req.session.user.refresh_token)
    .then(function (body) {
      util.saveToken(req, body.access_token, body.refresh_token);
      return spotify.getPlaylistTracks(target_ownerId, target_playlistId, body.access_token);
    });
  })

  .then(function(playlist) {
    // get track data from echonest
    var songUris = playlist.items.map(function(item) {
      return item.track.uri;
    });
    return echonest.getTrackData(songUris);
  })

  .then(function(songs) {
    res.json(util.danceableFiltering(songs, target_turntness));
  })

  .catch(function (e) {
    console.error('Got error: ',e);
    res.status(e.status || 500);
    res.json('Internal server error');
  });
});

module.exports = router;