// eslint-disable-next-line no-use-before-define


const query = 'query{'
    + 'allQuestions{'
    + 'likes, '
    + 'dislikes '
    + 'questionFrontendId '
    + 'difficulty '
    + 'categoryTitle '
    + 'topicTags{ '
        + 'slug '
    + '}'
+ '}'
+ '}';
let allData = {};

let lastElement;


const getAllQuestions = () => fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({ query }),
})
  .then((r) => r.json());

getAllQuestions().then((data) => {
  data.data.allQuestions.forEach((elem) => {
    const {
      questionFrontendId, likes, dislikes, difficulty, topicTags, categoryTitle,
    } = elem;
    allData[questionFrontendId] = {
      likes,
      dislikes,
      ratio: (parseInt(likes, 10) / parseInt(dislikes, 10)).toFixed(2),
    };
  });
});

// eslint-disable-next-line no-unused-vars
function getSortedByAttr(data, attr) {
  const arr = [];
  Object.keys(data).forEach((prop) => {
    if (Object.prototype.hasOwnProperty.call(data, prop)) {
      const obj = {};
      obj[prop] = data[prop];
      obj.tempSortName = data[prop][attr];
      arr.push(obj);
    }
  });

  arr.sort((a, b) => {
    const at = a.tempSortName;
    const bt = b.tempSortName;
    if (at > bt) return 1;
    if (at < bt) return -1;
    return 0;
  });
  return arr;
  // const result = [];

  // for (let i = 0, l = arr.length; i < l; i += 1) {
  //   const obj = arr[i];

  //   Object.keys(obj).forEach((prop) => {
  //     if (Object.prototype.hasOwnProperty.call(obj, prop)) {
  //       // eslint-disable-next-line no-unused-vars
  //       const id = prop;
  //       // eslint-disable-next-line no-undef
  //       const item = obj[id];
  //       result.push(item);
  //     }
  //   });
  // }
  // console.log(result);
  // return result;
}


// eslint-disable-next-line no-unused-vars
const getLastElementOfArray = (array) => array[array.length - 1];


// there exists a case when your filters match no questions,
// table disappears and you should rerender likes/dislikes/ratio elements

// eslint-disable-next-line max-len
const noQuestionsInPage = (questionPointerElements) => (questionPointerElements == null || questionPointerElements === undefined);


const getQuestionsTable = () => new Promise((resolve) => resolve(document.querySelector('.table-responsive.question-list-table')));


const fillQuestionsToArray = (questionPointers) => new Promise((resolve) => {
  const result = [];

  // Case: User made filter that matches no questions,
  // table disappears with likes/dislikes/ratio buttons
  const menuRow = questionPointers[0];
  const hasLikesDislikesRationButtons = Array.from(menuRow.getElementsByTagName('th')).length > 7;
  result.hasLikesDislikesRationButtons = hasLikesDislikesRationButtons;
  result.menuRow = menuRow;


  questionPointers.slice(1, -1).forEach((questionDOMPointer) => {
    const tds = questionDOMPointer.getElementsByTagName('td');

    const questionIndex = tds[1].innerHTML;
    const values = allData[questionIndex];


    result.push({
      questionDOMPointer,
      values,
    });
  });

  resolve(result);
});

const getQuestionsInPage = (onlyQuestionPointers = false) => new Promise((resolve) => {
  // eslint-disable-next-line no-use-before-define
  const jsInitChecktimer = setInterval(checkForJSFinish, 222);

  function checkForJSFinish() {
    getQuestionsTable().then((questionsTable) => {
      const questionPointerElements = questionsTable.getElementsByTagName('tr');

      if (noQuestionsInPage(questionPointerElements)) { resolve({}); }

      const questionPointers = Array.from(questionPointerElements);

      // WHY?:
      // Method calls automatically additional 2-3 times, to prevent it:
      if (getLastElementOfArray(questionPointers) === lastElement) {
        lastElement = getLastElementOfArray(questionPointers);
        return;
      }

      clearInterval(jsInitChecktimer);

      if (onlyQuestionPointers) resolve(questionPointers);

      fillQuestionsToArray(questionPointers).then((result) => resolve(result));
    });
  }
});


function getLikesDislikesRatioDOMElement(values) {
  const ratioTd = document.createElement('td');
  const ratio = parseInt(values.likes, 10) / parseInt(values.dislikes, 10);
  const ratioP = document.createElement('p');
  ratioP.className = 'ratio_value';
  ratioP.innerHTML = ratio.toFixed(2);
  ratioTd.appendChild(ratioP);


  const likeTd = document.createElement('td');
  const likeP = document.createElement('p');
  likeP.className = 'like_value';
  likeP.innerHTML = values.likes;
  likeTd.appendChild(likeP);

  const dislikeTd = document.createElement('td');
  const dislikeP = document.createElement('p');
  dislikeP.className = 'dislike_value';
  dislikeP.innerHTML = values.dislikes;
  dislikeTd.appendChild(dislikeP);

  return [likeTd, dislikeTd, ratioTd];
}


const whenClickedHandler = (e) => {
  const clickButtonName = e.toElement.innerHTML;
  allData = getSortedByAttr(allData, clickButtonName.toLowerCase());
  const questionPointers = getQuestionsInPage({ onlyQuestionPointers: true });
  console.log(allData);
  // for(let sortedQuestion of all_data){
  //
  // }
};


function getAdditionalButton(attr) {
  const th = document.createElement('th');
  th.classList.add(`reactable-th-${attr.toLowerCase()}`);
  th.classList.add('reactable-header-sortable');
  th.tabIndex = 0;
  th.role = 'button';
  const strong = document.createElement('strong');
  strong.innerHTML = attr;
  strong.onclick = whenClickedHandler;

  th.appendChild(strong);
  return th;
}


const addButtons = (questionsTable) => {
  // get all question elements
  const arr = Array.from(questionsTable.getElementsByTagName('tr'));
  const [menuRow] = arr;

  const likesButton = getAdditionalButton('Likes');
  menuRow.appendChild(likesButton);


  const dislikesButton = getAdditionalButton('Dislikes');
  menuRow.appendChild(dislikesButton);


  const ratioButton = getAdditionalButton('Ratio');
  menuRow.appendChild(ratioButton);
};


const updateQuestion = (question) => {
  const { questionDOMPointer, values } = question;

  const ratioP = questionDOMPointer.getElementsByClassName('ratio_value')[0];

  // ex: there was 20 questions in page, user changed filter
  // and it became 50, other 30 questions will not have tds(where to write l/d/r)
  if (ratioP == null) {
    const tds = getLikesDislikesRatioDOMElement(values);


    tds.forEach((td) => {
      questionDOMPointer.appendChild(td);
    });
    return;
  }


  // change values to new ones
  ratioP.innerHTML = values.ratio;

  const likeP = questionDOMPointer.getElementsByClassName('like_value')[0];
  likeP.innerHTML = values.likes;

  const dislikeP = questionDOMPointer.getElementsByClassName('dislike_value')[0];
  dislikeP.innerHTML = values.dislikes;
};


// Fires when filter changes
const updateLikesDislikesRatio = () => {
  getQuestionsInPage().then((questionsInPage) => {
    if (!questionsInPage.hasLikesDislikesRationButtons) {
      addButtons(questionsInPage.menuRow);
    }

    questionsInPage.forEach((question) => {
      if (question.values) {
        updateQuestion(question);
      } else { // question for subscriptions
        console.log('(');
      }
    });
  });
};


const observerOfFilter = new MutationObserver(() => {
  updateLikesDislikesRatio();
});

const drawLikesDislikesRatio = () => {
  getQuestionsInPage().then((questionsInPage) => {
    questionsInPage.forEach((question) => {
      const { questionDOMPointer, values } = question;
      if (values) {
        const tds = getLikesDislikesRatioDOMElement(values);
        tds.forEach((td) => {
          questionDOMPointer.appendChild(td);
        });
      } else { // question for subscriptions
        console.log('(');
      }
    });
  });
};

// Why returning promise? After filling AllData, need to take all questions in current page,
// all questions are taken from AllData
const fillAllData = () => new Promise((resolve) => {
  getAllQuestions().then((data) => {
    data.data.allQuestions.forEach((elem) => {
      const { questionFrontendId, likes, dislikes } = elem;
      allData[questionFrontendId] = {
        likes,
        dislikes,
        ratio: (parseInt(likes, 10) / parseInt(dislikes, 10)).toFixed(2),
      };
    });
    resolve({});
  });
});

const tableInPage = (questionsTable) => (typeof (questionsTable) !== 'undefined' && questionsTable != null);

function main() {
  // eslint-disable-next-line no-use-before-define
  const jsInitChecktimer = setInterval(checkForJSFinish, 222);

  function checkForJSFinish() {
    getQuestionsTable().then((questionsTable) => {
    // wait until table was rendered
      if (tableInPage(questionsTable)) {
        const filterToObserv = document.querySelector('.filter-selected-tags.col-xs-12');

        observerOfFilter.observe(filterToObserv, {
          subtree: true,
          childList: true,
          characterData: true,
        });
        clearInterval(jsInitChecktimer);


        // add 3 button(blocks): Likes/Dislikes/Ratio

        addButtons(questionsTable);


        fillAllData().then(() => {
          drawLikesDislikesRatio();
        });
      }
    });
  }
}

window.addEventListener('load', main, false);
