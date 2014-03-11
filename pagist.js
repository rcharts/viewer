Pagist.MathExtractor = function() {
  var map = {}
    , nextID = 1
  function id(text) {
    for (;;) {
      var id = '$Math-' + nextID++ + '$'
      if (text.indexOf(id) == -1) return id
    }
  }
  return {
    extract: function(text) {
      return text.replace(/\\\([\s\S]+?\\\)|\$\$[\s\S]+?\$\$/g, function(a) {
        var r = id(text)
        map[r] = a
        return r
      })
    }
  , insert: function(text) {
      for (var i in map) {
        if (Object.prototype.hasOwnProperty.call(map, i)) {
          text = text.split(i).join(map[i])
        }
      }
      return text
    }
  }
}

Pagist.DEFAULT_LAYOUT = function(html) {
  return '<link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css" rel="stylesheet">'
    + '<link href="css.css" rel="stylesheet">'
    + '<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet">'
    + '<link href="http://getbootstrap.com/2.3.2/assets/js/google-code-prettify/prettify.css" rel="stylesheet">'
    + '<script src="http://code.jquery.com/jquery.min.js"><\/script>'
    + '<script src="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min.js"><\/script>'
    + '<script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"><\/script>'
    + '<div class="container">' 
    +  this.ribbon 
    + '<h2>' + (this.title || '') + '</h2>'
    +   this.sharing
    +  '<br/>'
    +   this.editme
    +   html
    +   this.comments
    + '</div>'
    + '<div class="footer">'
    +   (this.footer || '')
    + '</div>'
}

Pagist.filetypes['.html'] = function(text) {
  return text
}

Pagist.filetypes['.css'] = function(text) {
  return '<style>' + text + '</style>'
}

Pagist.filetypes['.js'] = function(text) {
  return '<script>' + text + '</script>'
}

Pagist.filetypes['.R'] = function(text){
  return ''
}

Pagist.render = function(files, context) {
  var html = ''
    , list = files.slice()
  list.sort(function(a, b) {
    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0
  })
  for (var i = 0; i < list.length; i ++) {
    var file = list[i]
      , suffix = file.filename.match(/\.\w+/)
    if (suffix && Pagist.filetypes[suffix[0]]) {
      html += Pagist.filetypes[suffix[0]].call(file, file.content)
    } else {
      html += '<p>Unknown file: ' + file.filename + '</p>'
    }
  }
  return (Pagist.layout || Pagist.DEFAULT_LAYOUT).call(context, html)
}

Pagist.main = function() {

  var id = location.search.match(/^\?([^\/]+\/\w*|\w+)/)
    , endpoint

  if (!id) {
    // location.href = 'https://github.com/pagist/pagist.github.com/'
    // return
    id = '5624512'
  } else {
    id = id[1]
  }

  if (id.indexOf('/') == -1) {
    endpoint = 'https://api.github.com/gists/' + id
  } else {
    endpoint = 'http://' + id
  }

  window.handleGistData = function(res) {
    document.title = res.data.description
    var list = []
      , files = res.data.files
      , html = ''
    for (var i in files) {
      if (Object.prototype.hasOwnProperty.call(files, i)) {
        if (!files[i].filename) files[i].filename = ""
        list.push(files[i])
      }
    }
    var title = res.data.description
    var editme = '<a class="btn btn-success btn-mini" href="/viewer/live/index.html#?n=' + res.data.id + '"> <span class="fa fa-edit"></span> Edit Me </a>';
    var footer =
          '<b>gist <a href="' + res.data.html_url + '">#' + res.data.id + '</a></b>'
        + ' by <a href="https://github.com/' + res.data.user.login + '">' + res.data.user.login + '</a>'
        + ' <a href="' + res.data.html_url + '#comments">&raquo; comments</a>'
      , 
      
     ribbon = '<a href="' + res.data.html_url + '">' + 
     '<img style="position: absolute; top: 0; left: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_left_green_007200.png" alt="Fork me on GitHub"></a>',
     comments = " <div id=\"disqus_thread\"></div>\n    <script type=\"text/javascript\">\n        /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */\n        var disqus_shortname = 'rcharts'; // required: replace example with your forum shortname\n\n        /* * * DON'T EDIT BELOW THIS LINE * * */\n        (function() {\n            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;\n            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';\n            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);\n        })();\n    </script>\n    <noscript>Please enable JavaScript to view the <a href=\"http://disqus.com/?ref_noscript\">comments powered by Disqus.</a></noscript>\n    <a href=\"http://disqus.com\" class=\"dsq-brlink\">comments powered by <span class=\"logo-disqus\">Disqus</span></a>\n    ",
     sharing = '<!-- AddThis Button BEGIN -->\n<div class="addthis_toolbox addthis_default_style ">\n<a class="addthis_button_facebook_like" fb:like:layout="button_count"></a>\n<a class="addthis_button_tweet"></a>\n<a class="addthis_button_pinterest_pinit"></a>\n<a class="addthis_counter addthis_pill_style"></a>\n</div>\n<script type="text/javascript">var addthis_config = {"data_track_addressbar":true};</script>\n<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-4fdfcfd4773d48d3"></script>\n<!-- AddThis Button END -->'
     context = { footer: footer, title: title, ribbon: ribbon, comments: comments,
       sharing: sharing, editme: editme }
    document.write(Pagist.render(list, context))
  }

  document.write(
    '<script src="' + endpoint
  + '?callback=handleGistData&nocache=' + new Date().getTime() + '"><\/script>'
  )

}
