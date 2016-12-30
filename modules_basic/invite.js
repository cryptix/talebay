'use strict'
var ref = require('ssb-ref')
var ssbClient = require('ssb-client')
var id = require('../keys').id
var h = require('hyperscript')

var Progress = require('hyperprogress')

//var plugs = require('../plugs')
//var sbot_publish = plugs.first(exports.sbot_publish = [])
//var sbot_gossip_connect = plugs.first(exports.sbot_gossip_connect = [])
//var follower_of = plugs.first(exports.follower_of = [])

exports.needs = {
  sbot_publish: 'first',
  sbot_gossip_connect: 'first',
  follower_of: 'first',
  invite_parse: 'first',
}

exports.gives = {
  invite_parse: true,
  invite_accept: true,
  screen_view: true
}

exports.create = function (api) {
  var self
  return self = {
    invite_parse: function (invite) {
      return ref.parseInvite(invite)
    },

    invite_accept: function (invite, onProgress, cb) {
      var data = self.invite_parse(invite)
      if(!data) return cb(new Error('not a valid invite code:' + invite))

      onProgress('Connecting...')

      api.sbot_gossip_connect(data.remote, function (err) {
        if(err) console.log(err)
      })

      ssbClient(null, {
        remote: data.invite,
        manifest: { invite: {use: 'async'}, getAddress: 'async' }
      }, function (err, sbot) {
        if(err) return cb(err)
        onProgress('Requesting follow...')
        console.log(sbot)
        sbot.invite.use({feed: id}, function (err, msg) {

          //if they already follow us, just check we actually follow them.
          if(err) api.follower_of(id, data.key, function (_err, follows) {
            if(follows) { location.hash = '' }
            else next()
          })
          else next()

          function next () {
            onProgress('Following...')

            //remove the seed from the shs address.
            //then it's correct address.
            //this should make the browser connect to this as remote.
            //we don't want to do this if when using this locally, though.
            if(process.title === 'browser')
              localStorage.remote = data.remote

            api.sbot_publish({
              type: 'contact',
              contact: data.key,
              following: true,
            }, cb)
          }
        })
      })
    },
      
   

    screen_view: function (invite) {

      var data = ref.parseInvite(invite)
      if(!data) return

      var progress = Progress(4)

      //connect to server
      //request follow
      //post pub announce
      //post follow pub
      var div = h('div.column.scroller',
        h('div',
          "you have been invited to join:", h('br'),
          h('code', data.invite)
        ),
        h('button', 'accept', {onclick: attempt}),
        h('div.hyperprogress_wrapper',
          progress)
      )

      function attempt () {
        self.invite_accept(invite, function (message) {
          progress.next(message)
        }, function (err) {
          if(err) return progress.fail(err)
          progress.complete()
          //check for redirect
          var parts = location.hash.substring(1).split('#')

          //TODO: handle in a consistent way with either hashrouting
          //or with tabs...
          if(parts[0] === data.invite)
            location.hash = ''
          else
            console.log("NO REDIRECT")
        })
      }

      // If we are in the browser,
      // and do not already have a remote set, automatically trigger the invite.
      if(process.title == 'browser' && !localStorage.remote) attempt()

      return div
    }
  }
}

