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
  menu_items: true,
  screen_view: true
}

exports.create = function (api) {
  return {
    menu_items: function () {
      return h('a', {href: '#/ting-profile'}, '/ting-profile')
    },

    screen_view: function (path) {
      if (path === '/ting-profile') {
        var skillList = ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9"]
        var content = h('div.column.scroller__content')
        var div = h('div.column.scroller',
          {style: {'overflow': 'auto'}},
          h("#profile_wrapper",
            h("img.image.profile_image#profile_image.float" ,{src: "https://placekitten.com/g/128/126"}),

            h(".float#description_wrapper",
              h(".name.float#profile_name", "Luroc_Late",
                h("img.float.pencil", {src: "pencil-64x64.png"})),
              h(".location.float", "Hamburg, DE",
                h("img.float.pencil", {src: "../../pencil-64x64.png"})),
              h(".float#profile_description", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed.")
            ),

            h(".float.skill_list#skill_list",
              skillList.map(function(skill) {
                return h(".skill_object.float#skill" , skill)
              }),
              h(".skill_object.float#skill_plus" , "+ skill")
            ),
            h(".profile_subscriptions.connections_wrapper",
              h(".name#connections_title", "Connections"),
              h("img.float.connections_image", {src: "https://placekitten.com/g/126/126"}),
              h("img.float.connections_image", {src: "https://placekitten.com/g/127/126"}),
              h("img.float.connections_image", {src: "https://placekitten.com/g/128/126"}),
              h("img.float.connections_image", {src: "https://placekitten.com/g/127/122"})
            ),
            h(".profile_subscriptions#profile_inserts",
              h(".name#profile_inserts_title", "Active Inserts"),
              h(".float.inserts_object", "insert1"),
              h(".float.inserts_object", "insert2"),
              h(".float.inserts_object", "insert3"),
              h(".float.inserts_object", "insert4"),
              h(".float.inserts_object", "insert5"),
              h(".float.inserts_object#new_insert", "New Insert")
            ),
            h(".float#stream", "/private Stream"),
            h('div.scroller__wrapper',
              content)
          ))


          /* todo:
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
        */

        return div
      }
    }
  }
}
