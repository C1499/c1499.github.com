
// A local search script with the help of [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
// Copyright (C) 2015 
// Joseph Pan <http://github.com/wzpan>
// Shuhao Mao <http://github.com/maoshuhao>
// Edited by MOxFIVE <http://github.com/MOxFIVE>
// Edited by Mingfei Gao <http://gaomf.cn>

var searchFunc = function(path, search_id, content_id) {
    'use strict';
    $.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {
            // get the contents from search data
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title: $( "title", this ).text(),
                    content: $("content",this).text(),
                    url: $( "url" , this).text()
                };
            }).get();
            var $input = document.getElementById(search_id);
            var $resultContent = document.getElementById(content_id);
            $input.addEventListener('input', function(){
                var finalHTML='<ul class=\"search-result-list\">';
                var str = "";                
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";
                if (this.value.trim().length <= 0) {
                    return;
                }
                // Search result Array
                function SearchData(str, score) {
                    this.str = str;
                    this.score = score;
                }
                var SearchResultArr = new Array();
                var tmpscore;
                // perform local searching
                datas.forEach(function(data) {
                    var content_index = [];
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
                    var data_url = data.url.replace("http://gaomingfei.xyz","");
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;
                    // only match artiles with not empty titles and contents
                    if(data_title != '' && data_content != '') {
                        tmpscore = 0;
                        keywords.forEach(function(keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);
                            
                            if (index_title >= 0) {
                                tmpscore += 30;
                            }
                            if (index_content >= 0) {
                                if (first_occur < 0) {
                                    first_occur = index_content;
                                }
                                while (index_content >= 0) {
                                    tmpscore += 1;
                                    index_content = data_content.indexOf(keyword, index_content + 1);
                                }
                            }
                        });
                    }
                    // show search results
                    if (tmpscore > 0) {
                        str = "<li><a href='"+ data_url +"' class='search-result-title'>"+ "> " + data.title +"</a>";
                        var content = data.content.trim().replace(/<[^>]+>/g,"");
                        // cut out characters
                        var start = first_occur - 6;
                        var end = first_occur + 6;
                        if(start < 0){
                            start = 0;
                        }
                        if(start == 0){
                            end = 10;
                        }
                        if(end > content.length){
                            end = content.length;
                        }
                        var match_content = content.substr(start, end); 
                        // highlight all keywords
                        keywords.forEach(function(keyword){
                            var regS = new RegExp(keyword, "gi");
                            match_content = match_content.replace(regS, "<em class=\"search-keyword\">"+keyword+"</em>");
                        })
                        str += "<p class=\"search-result\">" + match_content +"...</p>"
                        
                        SearchResultArr.push(new SearchData(str, tmpscore));
                    }
                })
                
                // Sort Search Result
                function compareScore(a, b) {
                    return b.score - a.score;
                }
                SearchResultArr.sort(compareScore);
                
                // Final HTML
                SearchResultArr.forEach(function(data){
                    finalHTML += data.str;
                })
                $resultContent.innerHTML = finalHTML;
            })
        }
    })
}

var path = "/search.xml";
searchFunc(path, 'local-search-input', 'local-search-result');

var inputArea = document.querySelector("#local-search-input");
var getSearchFile = function(){
    var path = "/search.xml";
    searchFunc(path, 'local-search-input', 'local-search-result');
}

inputArea.onfocus = function(){ getSearchFile() }

var $resetButton = $("#search-form .fa-times");
var $resultArea = $("#local-search-result");

inputArea.oninput = function(){ $resetButton.show(); }
resetSearch = function(){
    $resultArea.html("");
    document.querySelector("#search-form").reset();
    $resetButton.hide();
    $(".no-result").hide();
}
inputArea.onkeydown = function(){ if(event.keyCode==13) return false}

$resultArea.bind("DOMNodeRemoved DOMNodeInserted", function(e) {
    if (!$(e.target).text()) {
        $(".no-result").show(200); 
    } else {
      $(".no-result").hide();
    }
})
