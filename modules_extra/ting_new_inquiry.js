var h = require('hyperscript')
var pull = require('pull-stream')

exports.needs = {
  message_compose: 'first',
  sbot_query: 'first',
  ting_allskills:'first'
}

exports.gives = {
  menu_items: true,
  builtin_tabs: true,
  screen_view: true
}

var tabName = '/ting-new-inqu1ry'

exports.create = function (api) {

  return {
    menu_items: function () {
      return h('a', {href:'#'+tabName}, tabName)
    },

    builtin_tabs: function () {
      return [tabName]
    },


    screen_view: function (path) {
      if(path !== tabName) return

      var skillFields = h('ul')
      pull(
        api.ting_allskills(),
        pull.filter(function(obj) { return obj.value.content.name != "" }),
        pull.drain(function(skMsg) {
          skillFields.appendChild(
            h('label',
              h('input.skillEls',{type:'checkbox', name:"wantedSkills", value:skMsg.key} ),
              skMsg.value.content.name
            )
          )
        })
      )

      var div = h('div.scroller', h('div.scroller__wrapper',
        h('h1', 'create new inqu1ry'),

        h('h3', 'do you want to the hat on in this project or do you only want to share the idea?'),
        h('label',
          h('input', {type: 'radio', name:"hatOrNoHat", value:"proj", checked:true}),
          "Yes, i want to have the Hat on in this project"),
        h('label',
          h('input', {type: 'radio', name:"hatOrNoHat", value:"idea"}),
          "No, just an Idea"),

        h('h3', 'select skill positions'),
        skillFields,

        h('h3', 'add a description and press publish'),
        api.message_compose(
          {type: 'ting-inquiry'},
          {
            placeholder: "write a description",
            prepublish: function (value) {
              // get hat or no-hat
              value.hat = null
              var els = div.querySelectorAll('input[name=hatOrNoHat]')
              for(var n = els.length-1; n>=0; n--) {
                if (els[n].checked == true && els[n].value == "proj") {
                  value.hat = require('../keys').id
                }
              }

              // selected skills
              value.skills = []
              var els = div.querySelectorAll('input[name=wantedSkills]')
              for(var n = els.length-1; n>=0; n--) {
                if (els[n].checked == true) {
                  value.skills.push(els[n].value)
                }
              }
              return value
            }
          }
        )

      ))
      return div
    }
  }
}
