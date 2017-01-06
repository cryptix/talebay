'use strict'
var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var Scroller = require('pull-scroll')
var ref = require('ssb-ref')

function map(ary, iter) {
  if(Array.isArray(ary)) return ary.map(iter)
}

exports.needs = {
  message_render: 'first',
  message_compose: 'first',
  message_unbox: 'first',
  sbot_log: 'first',
  sbot_whoami: 'first',
  avatar_link: 'first',
  emoji_url: 'first'
}

exports.gives = {
  builtin_tabs: true,
  screen_view: true,
  message_meta: true,
  message_content_mini: true
}

exports.create = function (api) {

  function unbox () {
    return pull(
      pull.filter(function (msg) {
        return 'string' == typeof msg.value.content
      }),
      pull.map(function (msg) {
        return api.message_unbox(msg)
      }),
      pull.filter(Boolean)
    )
  }

  return {
    builtin_tabs: function () {
      return ['/private']
    },

    screen_view: function (path) {
      if(path !== '/private') return

      var div = h('div.column.scroller',
          {style: {'overflow':'auto'}})

      // if local id is different from sbot id, sbot won't have indexes of
      // private threads
      //TODO: put all private indexes client side.
      var id = require('../keys').id
      api.sbot_whoami(function (err, feed) {
        if (err) return console.error(err)
        if(id !== feed.id)
          return div.appendChild(h('h4',
            'Private messages are not supported in the lite client.'))

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
            placeholder: 'Write a private message'
          }
          )

        var content = h('div.column.scroller__content')
        div.appendChild(h('div.scroller__wrapper', compose, content))

        pull(
          u.next(api.sbot_log, {old: false, limit: 100}),
          unbox(),
          Scroller(div, content, api.message_render, true, false)
        )

        pull(
          u.next(api.sbot_log, {reverse: true, limit: 1000}),
          unbox(),
          Scroller(div, content, api.message_render, false, false, function (err) {
            if(err) throw err
          })
        )
      })

      return div
    },

    message_meta: function (msg) {
      if(msg.value.content.recps || msg.value.private)
        return h('span.row', 'PRIVATE', map(msg.value.content.recps, function (id) {
          return api.avatar_link('string' == typeof id ? id : id.link)
        }))
    },

    message_content_mini: function (msg, sbot)  {
      if (typeof msg.value.content === 'string') {
        var icon = api.emoji_url('lock')
        return icon
          ? h('img', {className: 'emoji', src: icon})
          : 'PRIVATE'
      }
    }
  }

}

