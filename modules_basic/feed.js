var ref = require('ssb-ref')
var Scroller = require('pull-scroll')
var h = require('hyperscript')
var pull = require('pull-stream')
var u = require('../util')

//var plugs = require('../plugs')
//var sbot_user_feed = plugs.first(exports.sbot_user_feed = [])
//var message_render = plugs.first(exports.message_render = [])
//var avatar_profile = plugs.first(exports.avatar_profile = [])
//var signifier      = plugs.first(exports.signifier = [])

exports.needs = {
  sbot_user_feed: 'first',
  message_render: 'first',
  avatar_profile: 'first',
  signifier: 'first',
  message_compose: 'first'

}

exports.gives = 'screen_view'


exports.create = function (api) {

  return function (id) {
    //TODO: header of user info, avatars, names, follows.
      

        var compose = api.message_compose(
          {type: 'post', recps: [], private: true},
          {
            prepublish: function (msg) {
              msg.recps = [id].concat(msg.mentions).filter(function (e) {
                return ref.isFeed('string' === typeof e ? e : e.link)
              })
              if(!msg.recps.length)
                throw new Error('cannot make private message without recipients - just mention the user in an at reply in the message you send')
              return msg
            },
            placeholder: 'Write a private message',
            recipient: id
          }
          )  
      

    if(ref.isFeed(id)) {

      var content = h('div.column.scroller__content')
      var div = h('div.column.scroller',
        {style: {'overflow':'auto'}},
        h('div.scroller__wrapper',
          h('div', api.avatar_profile(id)),
          compose, content
        )
      )
      
      

     

      api.signifier(id, function (_, names) {
        if(names.length) div.title = names[0].name
      })


      pull(
        api.sbot_user_feed({id: id, old: false, live: true}),
        Scroller(div, content, api.message_render, true, false)
      )

      //how to handle when have scrolled past the start???

      pull(
        u.next(api.sbot_user_feed, {
          id: id, reverse: true,
          limit: 50, live: false
        }, ['value', 'sequence']),
        pull.through(console.log.bind(console)),
        Scroller(div, content, api.message_render, false, false)
      )

      return div

    }
  }

}

