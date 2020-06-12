
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
clearInterval(jsInitIconTimer);
changeExtensionIcon('./assets/readyIcon.png');
});

