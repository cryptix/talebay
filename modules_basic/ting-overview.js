'use strict'

var h = require('hyperscript')
var pull = require('pull-stream')

exports.needs = {
  screen_view: 'first',
  message_name: 'first',
  sbot_query: 'first',
  markdown:'first'
}

exports.gives = {
  builtin_tabs: true,
  screen_view: true
}

exports.create = function (api) {

  return {
    builtin_tabs: function () {
      return ['/t4l3']
    },

    screen_view: function (path) {
      if(path !== '/t4l3') return


      pull(
        api.sbot_query({query: [
          {"$filter": {
            "value":{
              "author": require('../keys.js').id,
              "content": {
                "type":"ting-adopt",
              }
            }
          }},
          {"$map": {
            "inquiry": ["value","content","inquiry"]
          }}
        ]}),
        pull.unique("inquiry"),
        pull.drain(function(msg) {
          api.message_name(msg.inquiry, function (err, name) {
            if(err) { throw err; return}
            content.appendChild(h('div.skill_object.float',
              h('a',{href:"#"+msg.inquiry}, name)))
          })
        })
      )

 //       function setSelected (indexes) {
 //   var ids = indexes.map(function (index) {
 //     return tabs.get(index).id
 //   })
 //   if(search)
 //     if(ids.length > 1)
 //       search.value = 'split('+ids.join(',')+')'
 //     else
 //       search.value = ids[0]
 // }

      
      
//      var search
//    var tabs = Tabs(setSelected)
//
//    search = api.search_box(function (path, change) {
//
//      var el = api.screen_view(path)
//
//      if(el) {
//       
//        tabs.add(el, change)
//  //      localStorage.openTabs = JSON.stringify(tabs.tabs)
//        return change
//      }
//    })
      
      
      
      
      var content = h('div.my_inquiries')
      var div = h('div.column.scroller',
        {style: {'overflow':'auto'}},
        h('div.scroller__wrapper__overview',
          h('div.column.scroller__content__overview'),
            h('div.profile_headline', h('div.padded',"t4l3")),
            
            h('div.profile_headline_short', "about"),
          h('div.text_wrapper',
            api.markdown(`# t4l3 is a platform for collaboration.
 You can use it to search for collaborators that are needed for a certain idea or find ideas that need your help. 

Imagine this platform as a black board, where you can share ideas, combine skills and get in contact to make things happen.

t4l3 is based on [patchbay](https://github.com/ssbc/patchbay) which relies on the [Secure Scuttlebutt](https://ssbc.github.io/secure-scuttlebutt/) protocol. Secure Scuttlebutt is a p2p protocol, please consider running the local client. You can extract your personal key by typing "/key" in the searchbox in the bottom left.

Please start by editing your profile (2nd tab on the left) and defining one of your skills.

You can create new skills. New skills do not have to be for yourself and aren't adopted automatically. You can communicate your skills by clicking the adopt button. please check if skills are already available before creating a new one to prevent duplicates.

You can share new inquiries and attach needed skills.

To "take the hat" means to be responsible for the completion of an idea. You can create inquiries without taking the hat. In this case someone else can take it.

When you see an inquiry you want to work on, you can choose a skill position by clicking the (+) on the skill button.

To think is to share. to share is to know. to know is to help. TALE.

The client code is available on [github](https://github.com/cryptix/talebay) but if you don't like that, you can [this](http://git.scuttlebot.io/%25nrVrnO5An0BWMGK7yo1t%2Ft7YSSdNR8KKagWSaPYPbak%3D.sha256) one, which is hosted on [git-ssb](https://www.npmjs.com/package/git-ssb). 

**This is a prototype. If there are any problems try refreshing first. For more updates, see [this thread](%JdsKKcWwb/gsKmJyIkAA/pY03YU17Rw62ETdkUPhuuU=.sha256)**
`)),
          h('div.profile_headline_short.float', "quick links"),
          h("div.skill_object.float.clear", {style: {'background':'lightgreen','border-color':'green'}}, h('a', {href: '#/new_skill'}, 'new skill')),
          h("div.skill_object.float",{style: {'background':'lightgreen','border-color':'green'}}, h('a', {href: '#/new_inquiry'}, 'new inquiry')),
          h('div.introduction'),
          h('div.missing_skills'),
          h('div.missing_skills'),
          h('div.profile_headline_short.float.clear', 'inqu1ries you take part in:'),
          content
        ))

      return div;
    }
  }
}

