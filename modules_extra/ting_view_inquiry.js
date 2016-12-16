var h = require('hyperscript')
var u = require('../util')
var pull = require('pull-stream')
var Scroller = require('pull-scroll')

exports.needs = {
  message_render: 'first',
  message_compose: 'first',
  sbot_log: 'first'
}

exports.gives = {
  menu_items: true, screen_view: true
}

exports.create = function (api) {
  return {
    menu_items: function () {
      return h('a', {href: '#/ting-inqu1ry'}, '/ting-inqu1ry')
    },

    screen_view: function (path) {
      if (path === '/ting-inqu1ry') {
        var content = h('div.column.scroller__content')
        var div = h('div.column.scroller',
          {style: {'overflow': 'auto'}},
          h('div.scroller__wrapper', content)
        )

        pull(
          u.next(api.sbot_log, {old: false, limit: 100}),
          pull.filter(function (msg) { return msg.value.content.type.match(/^inqu1ry/) }),
          Scroller(div, content, api.message_render, true, false)
        )

        pull(
          u.next(api.sbot_log, {reverse: true, limit: 100, live: false}),
          pull.filter(function (msg) { return msg.value.content.type.match(/^inqu1ry/) }),
          Scroller(div, content, api.message_render, false, false)
        )

        return div
      }
    }
  }
}
