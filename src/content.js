/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-restricted-syntax */
// eslint-disable-next-line no-use-before-define

// TODO:

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
let lastSortedAttr;
let ascending = true;
let lastElement;
let filterTags = [];
let difficultyTag = '';
let drawnFirstTime = false;
const difficultyTags = ['Easy', 'Medium', 'Hard'];
const notFilterTags = ['Top 100 Liked Questions', 'Top Interview Questions', 'Favorite', 'Todo', 'Solved', 'Attempted'];

const getAllQuestions = () => fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({ query }),
})
  .then((r) => r.json());


const getSortedByAttr = (data, attr) => new Promise((resolve) => {
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
  const result = [];

  for (let i = 0, l = arr.length; i < l; i += 1) {
    const obj = arr[i];
    delete obj.tempSortName;
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        var id = prop;
      }
    }
    const item = obj[id];
    result.push(item);
  }


  resolve(result);
});


// eslint-disable-next-line no-unused-vars
const getLastElementOfArray = (array) => array[array.length - 1];


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


      const questionPointers = Array.from(questionPointerElements);
      if (noQuestionsInPage(questionPointers)) { resolve({}); }
      // WHY?:
      // Mxethod calls automatically additional 2-3 times, to prevent it:
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


const getLikesDislikesRatioDOMElement = (values) => {
  const ratioTd = document.createElement('td');
  const { ratio } = values;
  const ratioP = document.createElement('p');
  ratioP.className = 'ratio_value';
  ratioP.innerHTML = ratio;
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
};

// easy - success
// medium - warning
// hard - danger
const updateQuestionTR = (oldQuestionTR, newQuestion) => {
  const { questionFrontendId } = newQuestion;
  const { title } = newQuestion;
  const { solution } = newQuestion;
  const { acceptanceRate } = newQuestion;
  const { difficulty } = newQuestion;
  const formattedSlug = (title.toLowerCase().split(' ').join('-')).replace('\'', '');

  let difficultyColor = '';
  switch (difficulty) {
    case 'Easy':
      difficultyColor = 'success';
      break;
    case 'Medium':
      difficultyColor = 'warning';
      break;
    case 'Hard':
      difficultyColor = 'danger';
      break;
    default:
      console.log('whhhhhat?');
  }

  const oldQuestionTDs = Array.from(oldQuestionTR.getElementsByTagName('td'));
  // index
  oldQuestionTDs[1].innerHTML = questionFrontendId;

  // title
  const aTDDiv = oldQuestionTDs[2].getElementsByTagName('div')[0].getElementsByTagName('a')[0];
  aTDDiv.href = `/problems/${formattedSlug}`;
  aTDDiv.setAttribute('data-slug', formattedSlug);
  aTDDiv.innerHTML = title;

  // solution
  const solutionTD = oldQuestionTDs[3];
  const oldInnerHTML = solutionTD.innerHTML;
  if (oldInnerHTML) {
    if (solution) solutionTD.getElementsByTagName('a')[0].href = `/acticles/${formattedSlug}`;
    else { solutionTD.getElementsByTagName('a')[0].style.dispay = 'none'; }
  }

  // Error occures if uncomment it
  // webpack crashes when you try to add/delete html tags

  // else {
  //   const ashka = document.createElement('a');
  //   ashka.href = `/articles/${formattedSlug}`;
  //   ashka.innerHTML = '<i class="fa fa-file-text"></i>';
  //   oldQuestionTDs[3].appendChild(ashka);
  // }

  // // acceptance
  const acceptanceRatePointer = oldQuestionTDs[4];
  acceptanceRatePointer.setAttribute('value', acceptanceRate);
  acceptanceRatePointer.innerHTML = `${acceptanceRate}%`;

  // difficulty
  const spanPointer = oldQuestionTDs[5].getElementsByTagName('span')[0];
  spanPointer.setAttribute('class', '');
  spanPointer.classList.add('label');
  spanPointer.classList.add(`label-${difficultyColor}`);
  spanPointer.classList.add('round');
  spanPointer.innerHTML = difficulty;
};


const rerenderInSortedOrder = (sortedAllDataByAttr) => new Promise((resolve) => {
  getSortedDataByAttrWithFilters(sortedAllDataByAttr).then((sortedAllDataByAttrWithFilters) => {
    getQuestionsInPage(true).then((questionPointers) => {
      const arrQuestionPointers = Array.from(questionPointers).slice(1, -1);
      const questionCountPerPage = document.getElementsByTagName('select')[0].value;
      const currentPagePointer = document.getElementsByClassName('reactable-page-button reactable-current-page')[0];
      // if no pointer of current page - page number is 1
      const pageNumber = currentPagePointer ? currentPagePointer.innerHTML : 1;
      const arrToChange = sortedAllDataByAttrWithFilters.slice((pageNumber - 1) * questionCountPerPage, pageNumber * questionCountPerPage);
      arrQuestionPointers.forEach((oldQuestionTR, indexOfQuestion) => {
        const newQuestion = arrToChange[indexOfQuestion];
        updateQuestionTR(oldQuestionTR, newQuestion);
      });
      resolve({});
    });
  });
});

const getSortedDataByAttrWithFilters = (sortedAllDataByAttr) => new Promise((resolve) => {
  // if there is no filter, no need to check for match
  if ((!filterTags || !filterTags.length) && !difficultyTag) resolve(sortedAllDataByAttr);

  else {
    const result = sortedAllDataByAttr.filter((question) => {
      // if difficulty doesn't match
      if (difficultyTag && difficultyTag !== question.difficulty) {
        return false;
      }
      if (!filterTags || !filterTags.length) {
        return true;
      }

      return filterTags.some((tagName) => question.tagNames.includes(tagName));
    });
    resolve(result);
  }
});

const likesDislikesRatioHandler = (e) => {
  let clickedButtonName = e.toElement.innerHTML;
  clickedButtonName = clickedButtonName.replace('<strong>', '');
  clickedButtonName = clickedButtonName.replace('</strong>', '');
  getSortedByAttr(allData, clickedButtonName.toLowerCase()).then((sortedAllDataByAttr) => {
    sortedAllData = sortedAllDataByAttr;
    // one click renders on ascending order, another on descending
    if (clickedButtonName === lastSortedAttr) {
      if (ascending) sortedAllDataByAttr.reverse();
      ascending = !ascending;
    } else ascending = true;
    lastSortedAttr = clickedButtonName;


    rerenderInSortedOrder(sortedAllDataByAttr).then(() => {
      updateLikesDislikesRatio();
    });
  });
};

const paginationButtonsHandler = () => {
  if (['Likes', 'Dislikes', 'Ratio'].includes(lastSortedAttr)) {
    rerenderInSortedOrder(sortedAllData).then(() => {
      updateLikesDislikesRatio();
    });
  } else {
    updateLikesDislikesRatio();
  }
};


const getAdditionalButton = (attr) => {
  const th = document.createElement('th');
  th.classList.add(`reactable-th-${attr.toLowerCase()}`);
  th.classList.add('reactable-header-sortable');
  th.tabIndex = 0;
  th.setAttribute('role', 'button');
  const strong = document.createElement('strong');
  strong.innerHTML = attr;
  th.onclick = likesDislikesRatioHandler;

  th.appendChild(strong);
  return th;
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

const addButtons = (menuRow) => {
  const menuButtons = Array.from(menuRow.getElementsByTagName('th'));
  // page questions are update whenever user clicks on menubutton to sort
  menuButtons.forEach((menuButton) => {
    const tempButton = menuButton;
    tempButton.onclick = menuButtonsHandler;
  });

  const likesButton = getAdditionalButton('Likes');
  menuRow.appendChild(likesButton);


  const dislikesButton = getAdditionalButton('Dislikes');
  menuRow.appendChild(dislikesButton);

  const ratioButton = getAdditionalButton('Ratio');
  menuRow.appendChild(ratioButton);
};

// Fires when filter changes
const updateLikesDislikesRatio = () => {
  console.log('updating');

  getQuestionsInPage().then((questionsInPage) => {
    if (!questionsInPage.hasLikesDislikesRationButtons && drawnFirstTime) {
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

const menuButtonsHandler = (e) => {
  const clickedButtonName = e.toElement.innerHTML;
  lastSortedAttr = clickedButtonName;
  updateLikesDislikesRatio();
};

const updateFiltersArray = () => {
  const filterTagBar = document.getElementsByClassName('filter-tag-bar')[0];
  const spans = Array.from(filterTagBar.getElementsByTagName('span'));
  const newFilterTags = [];

  let difficultyTagInFilters = false;
  spans.forEach((span) => {
    const { innerHTML } = span;
    const filterLabel = innerHTML.substr(0, innerHTML.indexOf('<i'));

    if (difficultyTags.includes(filterLabel)) {
      difficultyTag = filterLabel;
      difficultyTagInFilters = true;
    } else if (!notFilterTags.includes(filterLabel)) {
      newFilterTags.push(filterLabel);
    }
  });
  if (!difficultyTagInFilters) difficultyTag = '';
  filterTags = newFilterTags;
};

const observerOfFilter = new MutationObserver(() => {
  updateLikesDislikesRatio();
  updateFiltersArray();
  setOnClickHandlerPaginationButtons();
});

const drawLikesDislikesRatio = () => {
  getQuestionsInPage().then((questionsInPage) => {
    // add 3 button(blocks): Likes/Dislikes/Ratio
    addButtons(questionsInPage.menuRow);

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


const tableInPage = (questionsTable) => (typeof (questionsTable) !== 'undefined' && questionsTable != null);

const setOnClickHandlerPaginationButtons = () => {
  const paginationButtons = Array.from(document.getElementsByClassName('pagination-buttons')[0].getElementsByTagName('a'));
  paginationButtons.forEach((noNeed, index) => {
    paginationButtons[index].onclick = paginationButtonsHandler;
  });
};

const updateExtensionIcon = (values) => {
  const { value } = values;
  const { rotatePosition } = values;
  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value,
    rotatePosition,
  });
};

const main = () => {
  // eslint-disable-next-line no-use-before-define
  const jsInitTableTimer = setInterval(checkForTableRender, 222);
  const jsInitIconTimer = setInterval(checkForIconChange, 111);


  var rotatePosition = 1;
  function checkForIconChange() {
    updateExtensionIcon({
      value: 'rotate',
      rotatePosition,
    });
    rotatePosition %= 4;
    rotatePosition += 1;
  }

  function checkForTableRender() {
    getQuestionsTable().then((questionsTable) => {
    // wait until table was rendered
      if (tableInPage(questionsTable)) {
        const filterToObserv = document.querySelector('.filter-selected-tags.col-xs-12');

        updateFiltersArray();
        observerOfFilter.observe(filterToObserv, {
          subtree: true,
          childList: true,
          characterData: true,
        });
        clearInterval(jsInitTableTimer);

        fillAllData().then(() => {
          drawLikesDislikesRatio();
          drawnFirstTime = true;
          clearInterval(jsInitIconTimer);
          updateExtensionIcon({ value: 'ready' });
        });

        setOnClickHandlerPaginationButtons();
      }
    });
  }
};


window.addEventListener('load', main, false);
