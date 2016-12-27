var h = require('hyperscript')
var pull = require('pull-stream')
var pullSort = require('pull-sort')

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

      var skillFields = h('div.skill_wrapper')
      pull(
        api.ting_allskills(),
        pull.filter(function(obj) { return obj.value.content.name != "" }),
        pullSort(function(a, b){
          var a = a.value.content.name
          var b = b.value.content.name
          if(a < b) return -1;
          if(a > b) return 1;
          return 0;
        }),
        pull.drain(function(skMsg) {
          skillFields.appendChild(
            h('div.skill_object.float',
              h('input.skillEls',{type:'checkbox', name:"wantedSkills", value:skMsg.key} ),
              skMsg.value.content.name
            )
          )
        })
      )

      var div = h('div.scroller', h('div.scroller__wrapper',
        h('div.profile_headline', 'describe your project'),
        h('div.compose_wrapper',
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
          )),

        h('div.profile_headline_short.float.clear', 'do you want the hat?'),
        h('label.float.clear',
          h('input', {type: 'radio', name:"hatOrNoHat", value:"proj", checked:true}),
          "Yes, i want to have the Hat on in this project"),
        h('label.float.clear',
          h('input', {type: 'radio', name:"hatOrNoHat", value:"idea"}),
          "No, it's an Idea"),

        h('div.profile_headline_short.float.clear', 'select skill positions'),
        skillFields



      ))
      return div
    }
  }
}
