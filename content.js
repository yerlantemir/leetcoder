query = 'query {\
    allQuestions{\
    likes,\
    dislikes\
    questionId\
    difficulty\
    categoryTitle\
    topicTags{\
        slug\
    }\
}\
}';
all_data = {}

last_element = undefined



get_all_questions =()=>{
    
    return fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
                },
            body: JSON.stringify({query})
                })
            .then(r => r.json())
}

get_all_questions().then(data => {
    for(let elem of data['data']['allQuestions']){
        
        question_id = elem['questionId'];
        likes = elem['likes'];
        dislikes = elem['dislikes'];

        all_data[question_id] = {
            "likes": likes,
            "dislikes": dislikes,
            "ratio": (parseInt(likes) / parseInt(dislikes)).toFixed(2)
        }
    }
    
})

function get_sorted_by_attr(data, attr) {
    
    var arr = [];

    for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
            var obj = {};
            obj[prop] = data[prop];
            obj.tempSortName = data[prop][attr];
            arr.push(obj);
        }
    }

    arr.sort(function(a, b) {
        var at = a.tempSortName,
            bt = b.tempSortName;
        return at > bt ? 1 : ( at < bt ? -1 : 0 );
    });

    var result = [];
    for (var i=0, l=arr.length; i<l; i++) {
        var obj = arr[i];
        delete obj.tempSortName;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                var id = prop;
            }
        }
        var item = obj[id];
        result.push(item);
    }
    return result;
}


const get_last_element_of_array = (array) =>{
    return array[array.length - 1];
}



const get_questions_in_page = (onlyQuestionPointers=false, firstTime=false)=>{
    
    return new Promise((resolve, reject)=>{
        
        var jsInitChecktimer = setInterval(checkForJS_Finish, 222);

        function checkForJS_Finish(){

            var result = [];
            var divs = document.querySelector(".table-responsive.question-list-table");
            var questionPointers = Array.from(divs.getElementsByTagName("tr"));
            
            if(get_last_element_of_array(questionPointers) == last_element){
                last_element = get_last_element_of_array(questionPointers);
                return;
            }

            clearInterval (jsInitChecktimer);

            if (onlyQuestionPointers)
                resolve(questionPointers);
            
            for(let questionDOMPointer of questionPointers.slice(1,-1)){
                
                tds = questionDOMPointer.getElementsByTagName("td");
                
                question_index = tds[1].innerHTML;
                values = all_data[question_index];
                
                //graphql doesn't give values of 840's question, reason - undefined
                if(question_index === "840")
                    continue;
                
                result.push({
                    "questionDOMPointer": questionDOMPointer,
                    "values": values
                })
            }
        
            resolve(result);   
        }
        
    })    
    
}



window.addEventListener('load', main, false);


const observer_of_filter = new MutationObserver((mutations) => {

    get_questions_in_page().then((questions_in_page)=>{
        
        for(let question of questions_in_page){
            if(values){
    
                questionDOMPointer = question['questionDOMPointer'];
                values = question['values'];
    
                ratio_p = questionDOMPointer.getElementsByClassName("ratio_value")[0];
                
                if(ratio_p == null){
                    tds = get_likes_dislikes_dom_element(values);
    
    
                    for(let td of tds){
                        questionDOMPointer.appendChild(td);
                    }
                    continue;
                }
    
    
                ratio_p.innerHTML = values['ratio'];
    
                like_p = questionDOMPointer.getElementsByClassName("like_value")[0];
                like_p.innerHTML = values['likes'];
        
                dislike_p = questionDOMPointer.getElementsByClassName("dislike_value")[0];
                dislike_p.innerHTML = values['dislikes'];
    
            }
            // question for subscriptions
            else{
                console.log("(")
            }   
        }
    })
    
    

})


function main (evt) {
    
    var jsInitChecktimer = setInterval(checkForJS_Finish, 222);



    function checkForJS_Finish () {
        
    
        divs = document.querySelector(".table-responsive.question-list-table");
    
        if (typeof(divs) != 'undefined' & divs != null)
        {
            filter_to_observ = document.querySelector(".filter-selected-tags.col-xs-12");

            observer_of_filter.observe(filter_to_observ, {
                subtree:true,
                childList: true,
                characterData:true
            })
            
            clearInterval (jsInitChecktimer);
           
           
            var arr = Array.from(divs.getElementsByTagName("tr"));
            menu_row = arr[0];

            likes_button = get_additional_button("Likes");
            menu_row.appendChild(likes_button);
            
            
            dislikes_button = get_additional_button("Dislikes");
            menu_row.appendChild(dislikes_button);
            
            
            ratio_button = get_additional_button("Ratio");
            menu_row.appendChild(ratio_button);
            
            
            
            //filling all_data
            get_all_questions().then(data => {

                for(let elem of data['data']['allQuestions']){
                    
                    question_id = elem['questionId'];
                    likes = elem['likes'];
                    dislikes = elem['dislikes'];
        
                    all_data[question_id] = {
                        "likes": likes,
                        "dislikes": dislikes,
                        "ratio": (parseInt(likes) / parseInt(dislikes)).toFixed(2)
                    }
                }
                


                get_questions_in_page().then((questions_in_page)=>{
                    for(let question of questions_in_page){
    
                        questionDOMPointer = question['questionDOMPointer'];
                        values = question['values'];
    
                        if(values){
                            tds = get_likes_dislikes_dom_element(values);
                            for(let td of tds){
                                questionDOMPointer.appendChild(td);
                            }
                        }
                        // question for subscriptions
                        else{
                            console.log("(")
                        }   
                    }
                    
                })


            });
            
            
        }
    }

}

function get_likes_dislikes_dom_element(values){

    ratio_td = document.createElement('td');
    ratio = parseInt(values['likes']) / parseInt(values['dislikes'])
    ratio_p = document.createElement('p');
    ratio_p.className = "ratio_value";
    ratio_p.innerHTML = ratio.toFixed(2);
    ratio_td.appendChild(ratio_p)


    like_td = document.createElement('td');
    like_p = document.createElement('p');
    like_p.className = "like_value";
    like_p.innerHTML = values['likes'];
    like_td.appendChild(like_p);

    dislike_td = document.createElement('td');
    dislike_p = document.createElement('p');
    dislike_p.className = "dislike_value";
    dislike_p.innerHTML = values['dislikes'];
    dislike_td.appendChild(dislike_p);

    return [like_td, dislike_td, ratio_td];
}

function get_additional_button(attr){
    th = document.createElement('th')
    th.onclick = whenClickedHandler(attr);
    th.classList.add("reactable-th-"+attr.toLowerCase())
    th.classList.add("reactable-header-sortable")
    th.tabIndex = 0;
    th.role = "button";
    strong = document.createElement("strong");
    strong.innerHTML = attr;
    th.appendChild(strong);
    return th
}

whenClickedHandler = (attr) =>{
    all_data = get_sorted_by_attr(all_data, attr.toLowerCase());
    questionPointers = get_questions_in_page(onlyQuestionPointers=true);
    // for(let sortedQuestion of all_data){
// 
    // }
}











