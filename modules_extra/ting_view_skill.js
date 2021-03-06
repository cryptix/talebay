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
      return h('a', {href: '#/new_skill'}, '/new_skill')
    },

    screen_view: function (path) {
      if (path === '/new_skill') {
        var content = h('div.column.scroller__content__filter')
        var sk0rgName_el
        var div = h('div.column.scroller',
          {style: {'overflow': 'auto'}},
          h('div.scroller__wrapper',
            h('strong', {style: {'color':'red'}}, "Please check in the list below if the skill you  want to adopt is already present. Please don't create duplicates! The server is running slow at the moment, please give the list some time to load."),
            h('div.profile_headline', 'create new skill'),
            sk0rgName_el=h('input', {placeholder: "skill name"}),
            
              h('div.profile_headline_short', 'description'),
            h('div.compose_wrapper',
            api.message_compose(
              {type: 'sk0rg' },
              {
                placeholder: "write a description",
                prepublish: function (value) {
                  value.name = sk0rgName_el.value
                  return value
                }
              }
            )),
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
