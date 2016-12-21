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
      return h('a', {href: '#/ting-inserts'}, '/ting-inserts')
    },

    screen_view: function (path) {
      if (path === '/ting-inserts') {
        var content = h('div.column.scroller__content')
        var sk0rgName_el
        var div = h('div.column.scroller',
          {style: {'overflow': 'auto'}},
          h(".search_wrapper",
            h(".float.filter_object", "skillfilter"),
            h(".float.filter_object", "placefilter"),
            h(".float.filter_object", "demandfilter")
          ),

          h("#profiles_wrapper",
            h("img.image.profiles_image#profiles_image.float" ,{src: "https://placekitten.com/g/126/126"}
            ),
            h(".float#description_wrapper",
              h(".name.float#profiles_name", "Insert"),
              h(".location.float", "Hamburg, DE"),
              h(".float#profiles_description", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed.")
            ),
            h(".float.skill_list#skill_list")
          ),

          h("#profiles_wrapper",
            h("img.image.profiles_image#profiles_image.float" ,{src: "https://placekitten.com/g/125/126"}
            ),
            h(".float#description_wrapper",
              h(".name.float#profiles_name", "Insert"),
              h(".location.float", "Hamburg, DE"),
              h(".float#profiles_description", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed.")
            ),
            h(".float.skill_list#skill_list")
          ),
          h("#profiles_wrapper",
            h("img.image.profiles_image#profiles_image.float" ,{src: "https://placekitten.com/g/127/126"}
            ),
            h(".float#description_wrapper",
              h(".name.float#profiles_name", "Insert"),
              h(".location.float", "Hamburg, DE"),
              h(".float#profiles_description", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed.")
            ),
            h(".float.skill_list#skill_list")
          ),
          h("#profiles_wrapper",
            h("img.image.profiles_image#profiles_image.float" ,{src: "https://placekitten.com/g/128/126"}
            ),
            h(".float#description_wrapper",
              h(".name.float#profiles_name", "Insert"),
              h(".location.float", "Hamburg, DE"),
              h(".float#profiles_description", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed.")
            ),
            h(".float.skill_list#skill_list")
          ),
          h('div.scroller__wrapper',
            content)
        )


          /* inserts stream
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
