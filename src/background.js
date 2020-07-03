
const DateDiff = {

  inDays: function(d1, d2) {
      var t2 = d2.getTime();
      var t1 = d1.getTime();
      console.log(d1);
      console.log(d2);
      return parseInt((t2-t1)/(24*3600*1000));
  },

  inWeeks: function(d1, d2) {
      var t2 = d2.getTime();
      var t1 = d1.getTime();

      return parseInt((t2-t1)/(24*3600*1000*7));
  },

  inMonths: function(d1, d2) {
      var d1Y = d1.getFullYear();
      var d2Y = d2.getFullYear();
      var d1M = d1.getMonth();
      var d2M = d2.getMonth();

      return (d2M+12*d2Y)-(d1M+12*d1Y);
  },

  inYears: function(d1, d2) {
      return d2.getFullYear()-d1.getFullYear();
  }
}

// contest time-> saturday 2:30 UTC

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get('lastM', (lastUpdatedTime) =>{
  
    if (DateDiff.inDays(new Date(lastUpdatedTime.lastM), new Date()) >= 1){
      updateLocalStorage();
    }
  });
})

chrome.runtime.onInstalled.addListener(()=>{
  updateLocalStorage();
})


const updateLocalStorage = () =>{
  const query = 'query{'
          + 'allQuestions{'
          + 'likes, '
          + 'title  '
          + 'dislikes '
          + 'solution{ '
            + 'id '
          + '}'
          + 'questionFrontendId '
          + 'difficulty '
          + 'stats '
          + 'categoryTitle '
          + 'topicTags{ '
              + 'name '
          + '}'
          + '}'
          + '}';

  const allData = [];
  let sortedAllData = [];

  const getAllQuestions = () => fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
    })
    .then((r) => r.json());


  // Why returning promise? After filling AllData, need to fill all questions in current page,
  // all questions are filled from AllData
  const fillAllData = () => new Promise((resolve) => {
  getAllQuestions().then((data) => {
    data.data.allQuestions.forEach((elem) => {
      const {
        questionFrontendId, likes, dislikes, title, solution, stats, difficulty, topicTags,
      } = elem;
      const tagNames = [];
      topicTags.forEach((topicTag) => {
        tagNames.push(topicTag.name);
      });
      // acceptance rate is given with %, ex: 45.3%
      const acceptanceRate = JSON.parse(stats).acRate.replace('%', '');
      // if dislikes = 0, ratio will be = likes, because n/0 = infinity
      const likesDislikesRatio = dislikes ? (parseInt(likes, 10) / parseInt(dislikes, 10)).toFixed(2) : likes;

      const allValues = {
        likes,
        dislikes,
        ratio: likesDislikesRatio,
        title,
        solution,
        acceptanceRate,
        difficulty,
        tagNames,
      };
      allData[questionFrontendId] = allValues;
      allValues.questionFrontendId = questionFrontendId;
      sortedAllData.push(questionFrontendId);
    });
    resolve({});
  });
  });


  const changeExtensionIcon = (path) => { chrome.browserAction.setIcon({ path }); };

  const jsInitIconTimer = setInterval(checkForIconChange, 111);

  var rotatePosition = 1;
  function checkForIconChange() {
    rotatePosition %= 4;
    rotatePosition += 1;
    changeExtensionIcon(`./assets/loadingIcons/${rotatePosition}.png`);
  }

  fillAllData().then(()=>{
    chrome.storage.local.set({"allData": allData},
        function(){
            console.log('I set the value for allData');
        });
    chrome.storage.local.set({"sortedAllData": sortedAllData},
        function(){
            console.log('I set the value for sortedAllData');
        });
    chrome.storage.local.set({'lastM': `${new Date()}`});
    clearInterval(jsInitIconTimer);
    changeExtensionIcon('./assets/readyIcon.png');
  });
}


// every saturday leetcode makes contest with 4 questions and it should update(add last contest questions) allData
