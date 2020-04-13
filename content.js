


window.addEventListener('load', main, false);

divs = undefined
function main (evt) {
    
    var jsInitChecktimer = setInterval(checkForJS_Finish, 222);

    function checkForJS_Finish () {
        divs = document.getElementsByClassName("table-responsive question-list-table");
        
        if (typeof(divs[0]) != 'undefined')
         {
            clearInterval (jsInitChecktimer);

            var arr = Array.from(divs[0].getElementsByTagName("tr"))
            arr[0].appendChild(get_additional_button("Likes"));
            arr[0].appendChild(get_additional_button("Dislikes"));
            arr[0].appendChild(get_additional_button("Ratio"));

            questions_list = {}

            request_url = "http://127.0.0.1:5000/v1/get_data/?questions_index="
            
            for(let question of arr.slice(1,-1)){
                tds = question.getElementsByTagName("td");
                question_index = tds[1].innerHTML;
                request_url += question_index + ','
                
                questions_list[question_index] = question
            }

            const Http = new XMLHttpRequest();
            Http.open("GET", request_url);
            Http.send();

            Http.onreadystatechange = (e) => {
                if(Http.readyState == XMLHttpRequest.DONE){
                    var status = Http.status;
                    if (status === 0 || (status >= 200 && status < 400)) {
                      // The request has been completed successfully
                        likes_statistics = JSON.parse(Http.responseText);
                        for(let [key,value] of Object.entries(likes_statistics)){
                            questions_list[key].appendChild(get_likes_dislikes_dom_element(value))
                        }
                    } else {
                      // Oh no! There has been an error with the request!
                    }
                }
            }
        }
    }

}
function get_likes_dislikes_dom_element(values){
    td = document.createElement('td');
    
    ratio = parseInt(values['likes']) / parseInt(values['dislikes'])

    p = document.createElement('p');
    p.innerHTML = ratio.toFixed(2);

    td.appendChild(p)
    return td
}

function get_additional_button(text){
    th = document.createElement('th')
    th.classList.add("reactable-th-frequency")
    th.classList.add("reactable-header-sortable")
    th.tabIndex = 0;
    th.role = "button";
    strong = document.createElement("strong");
    strong.innerHTML = text;
    th.appendChild(strong);
    return th
}












