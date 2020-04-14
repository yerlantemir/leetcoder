




window.addEventListener('load', main, false);


const observer = new MutationObserver(function (mutations) {

    divs = document.querySelector(".table-responsive.question-list-table");
    var arr = Array.from(divs.getElementsByTagName("tr"))

    
    get_likes_from_db(arr).then((likes)=>{
        
        like_statistics = likes['like_statistics'];
        question2_index = likes['question2_index'];
        
        for(let [key,value] of Object.entries(like_statistics)){

            ratio_p = question2_index[key].getElementsByClassName("ratio_value")[0];
            
            if(ratio_p == null){
                
                tds_to_add = get_likes_dislikes_dom_element(value);
                
                for(let td of tds_to_add)
                    question2_index[key].appendChild(td);
                
                continue;

            }
            ratio_p.innerHTML = value['ratio'];

            like_p = question2_index[key].getElementsByClassName("like_value")[0];
            like_p.innerHTML = value['like'];
    
            dislike_p = question2_index[key].getElementsByClassName("dislike_value")[0];
            dislike_p.innerHTML = value['dislike'];

        }
    });

})


function main (evt) {
    
    var jsInitChecktimer = setInterval(checkForJS_Finish, 222);



    function checkForJS_Finish () {
        
        filter_to_observ = document.querySelector(".filter-selected-tags.col-xs-12");
    
        divs = document.querySelector(".table-responsive.question-list-table");
    
        if (typeof(divs) != 'undefined' & divs != null)
        {

            observer.observe(filter_to_observ, {
                subtree:true,
                childList: true,
                characterData:true
              })
            
            clearInterval (jsInitChecktimer);
           
           
            var arr = Array.from(divs.getElementsByTagName("tr"));
            menu_row = arr[0];
            
            menu_row.appendChild(get_additional_button("Likes"));
            menu_row.appendChild(get_additional_button("Dislikes"));
            menu_row.appendChild(get_additional_button("Ratio"));
            

            get_likes_from_db(arr).then((likes)=>{
                like_statistics = likes['like_statistics'];
                question2_index = likes['question2_index'];

                for(let [key,value] of Object.entries(like_statistics)){
                    tds_to_add = get_likes_dislikes_dom_element(value);
                    for(let td of tds_to_add)
                        question2_index[key].appendChild(td);
                }
            });
            
        }
    }

}

function get_likes_from_db(arr){

    return new Promise(function(resolve,reject){
        
        question2_index = {};

        request_url = "http://127.0.0.1:5000/v1/get_data/?questions_index=";
        
        
        for(let question of arr.slice(1,-1)){
            tds = question.getElementsByTagName("td");
            question_index = tds[1].innerHTML;
            request_url += question_index + ',';
            question2_index[question_index] = question;
        }
        
        const Http = new XMLHttpRequest();
        Http.open("GET", request_url);
        Http.send();


        Http.onreadystatechange = (e) => {

            if(Http.readyState == XMLHttpRequest.DONE){

                var status = Http.status;

                if (status === 0 || (status >= 200 && status < 400)) {
                    // The request has been completed successfully
                    like_statistics = JSON.parse(Http.responseText);

                    resolve({"like_statistics":like_statistics,
                            "question2_index": question2_index})
                }
            }
        }
    })
    
}
function get_likes_dislikes_dom_element(values){

    ratio_td = document.createElement('td');
    ratio = parseInt(values['like']) / parseInt(values['dislike'])
    ratio_p = document.createElement('p');
    ratio_p.className = "ratio_value";
    ratio_p.innerHTML = ratio.toFixed(2);
    ratio_td.appendChild(ratio_p)


    like_td = document.createElement('td');
    like_p = document.createElement('p');
    like_p.className = "like_value";
    like_p.innerHTML = values['like'];
    like_td.appendChild(like_p);

    dislike_td = document.createElement('td');
    dislike_p = document.createElement('p');
    dislike_p.className = "dislike_value";
    dislike_p.innerHTML = values['dislike'];
    dislike_td.appendChild(dislike_p);

    return [like_td, dislike_td, ratio_td];
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












