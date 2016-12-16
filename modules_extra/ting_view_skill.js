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
      return h('a', {href: '#/ting-sk0rg'}, '/ting-sk0rg')
    },

    screen_view: function (path) {
      if (path === '/ting-sk0rg') {
        var content = h('div.column.scroller__content')
        var sk0rgName_el
        var div = h('div.column.scroller',
          {style: {'overflow': 'auto'}},
          h('div.scroller__wrapper',
            sk0rgName_el=h('input', {placeholder: "sk0rg name"}),
            api.message_compose(
              {type: 'sk0rg' },
              {
                placeholder: "write a description",
                prepublish: function (value) {
                  value.name = sk0rgName_el.value
                  return value
                }
              }
            ),
            content)
        )


        function filterFn(msg) {
          if (typeof msg.value.content.type === 'undefined') return false
          return msg.value.content.type.match(/^sk0rg/)
        }

        pull(
          u.next(api.sbot_log, {old: false, limit: 100}),
          pull.filter(filterFn),
          Scroller(div, content, api.message_render, true, false)
        )

        pull(
          u.next(api.sbot_log, {reverse: true, limit: 100, live: false}),
          pull.filter(filterFn),
          Scroller(div, content, api.message_render, false, false)
        )

        return div
      }
    }
  }
}
