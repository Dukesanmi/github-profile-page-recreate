const log = console.log;
//const githubToken = JSON.Stringify(process.env.PERSONAL_ACCESS_TOKEN);
const variables = {
  "githubToken": process.env.GITHUB_TOKEN,
  "githubLogin": "Dukesanmi",
  //reposToFetch: 20
}
//const fetch = require('node-fetch');
const queryRepo = {
 "query": `
   query { 
  viewer {
    repositories(first: 25, orderBy: {field:CREATED_AT, direction:DESC}) {
      pageInfo {hasNextPage, endCursor}
      nodes {
        name
        url
        description
        isPrivate
        forkCount
        stargazerCount
        updatedAt
        licenseInfo {
          name
          nickname
        }
        languages(first: 50) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
        owner {
          login
        }
        defaultBranchRef {
          name
        }
      }
    }
  }
 } `
};

const queryProfile = {
 "query": `
   query { 
  user(login: "dukesanmi") {
    login
    name
    avatarUrl
    bio
    bioHTML
  }
 } `
};
const url = "https://api.github.com/graphql";
const headers = {
  "Content-type": "application/json",
  "Authorization": "bearer " + variables.githubToken
}
var profileData;
var repoData;

//Language display function
let htmlLang;
function langDisplay(arr, language) {
  let sorted;
  let sortedPool;
  function arrangeLang(a, b) {
    const sizeA = b.size;
    const sizeB = a.size;
    let compare = 0;
    if(sizeA > sizeB) {
      compare = 1;
    }
    else if(sizeB > sizeA) {
      compare = -1;
    }
    return compare;
  }
  sorted = arr.sort(arrangeLang);
  sortedPool = sorted.slice(0, 1);
  if(sortedPool.length > 0) {
    language = `<p class= 'lang'>${sortedPool[0].node.name}</p>`;
    language += `<i class = 'fas fa-circle' style = 'color: ${sorted[0].node.color}'></i>`;
  } 
  else {
    language = "";
  }
  return language;
}

let updateTime;
//Timestamp function
function timeStamp(lastUpdate, html) {
  let second = 1000;
  let minute = 60000;
  let hour = 3600000;
  let day = 86400000;
  let month = 2592000000;
  let year = 31536000000;
  let time;
  let monthsOfYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const todayDate = new Date().getTime();
  let updateDate = new Date(lastUpdate);
  let updatedAt = updateDate.getTime() - hour;
  let howLongAgo = todayDate - updatedAt;
  
  if(howLongAgo >=  second && howLongAgo < minute) {
    time = Math.floor(howLongAgo/second);
    if(time > 1) {
      html = `<p class='last-update'>Updated ${time} seconds ago</p>`;
    } else {
      html = `<p class='last-update'>Updated ${time} second ago</p>`;
    }
  }
  else if(howLongAgo >= minute && howLongAgo < hour) {
    time = Math.floor(howLongAgo/minute);
    if(time > 1) {
      html = `<p class='last-update'>Updated ${time} minutes ago</p>`;
    } else {
      html = `<p class='last-update'>Updated ${time} minute ago</p>`;
    }
  }
  else if(howLongAgo >= hour && howLongAgo < day ) {
    time = Math.floor(howLongAgo/hour);
    if(time > 1) {
      html = `<p class='last-update'>Updated ${time} hours ago</p>`;
    }
    else {
      html = `<p class='last-update'>Updated ${time} hour ago</p>`;
    }
  }
  else if(howLongAgo >= day && howLongAgo < month) {
    time = Math.floor(howLongAgo/day);
    if(time > 1) {
      html = `<p class='last-update'>Updated ${time} days ago</p>`;
    } else {
      html = `<p class='last-update'>Updated ${time} day ago</p>`;
    }
  }
  else if(howLongAgo > month && howLongAgo < year) {
    html = `<p class='last-update'>Updated on ${updateDate.getDate()} ${monthsOfYear[updateDate.getMonth()]}</p>`;
  }
  else if(howLongAgo > year) {
    html = `<p class='last-update'>Updated on ${updateDate.getDate()} ${monthsOfYear[updateDate.getMonth()]} ${updateDate.getFullYear()}</p>`;
  }
  return html;
}

log('code check 1');

(async () => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(queryProfile),
    headers: {'Content-Type': 'application/json', Authorization: "bearer " + variables.githubToken}
  });
  const json = await response.json();
  profileData = json.data;

  //log(json);
  log('code check 2 inside user fetch function');
  log(profileData);
  document.getElementById("avi-sm-mob").src= profileData.user.avatarUrl;  
  document.getElementById("avi-sm").src= profileData.user.avatarUrl;  
  document.getElementById("avatar").src = profileData.user.avatarUrl;
  document.getElementById("username").innerHTML = profileData.user.login;
  document.getElementById("name").innerHTML = profileData.user.name;
  document.getElementById("description").innerHTML = profileData.user.bio;
  document.getElementById("user-id").innerHTML = profileData.user.login;
})();


(async () => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(queryRepo),
    headers: {'Content-Type': 'application/json', Authorization: "bearer " + variables.githubToken}
  });
  const json = await response.json();
  repoData = json.data.viewer.repositories.nodes;
  var publicRepo = repoData.filter(repo => repo.isPrivate === false);
  log('code check 3 repo fetch function');
 //log(publicRepo);

 //Cards
  let html = "";
  let sorted;
  publicRepo.forEach(function(repo) {
    //log(repo);
    html += "<div class='repo-card'>";
    html += "<div class='repo-data'>";
    html += "<h2 class='repo-name'><a href=" + repo.url + "style='text-decoration: none'>" + repo.name +"</a></h2>";
    if(repo.description !== null) {
      html += "<p class= 'repo-description'>" + repo.description + "</p>";
    }
    html += "<div class= 'repo-meta'>";
    //Language 
    var langs = repo.languages.edges;
    //log(langs);
    html += `<div class ='lang-container'>`;
    html += langDisplay(langs, htmlLang);
    html += `</div>`;
    //Stargazer
    if(repo.stargazerCount > 0) {
      html += "<p class='stargaze countable-p'><i class='far fa-star countable-icon'></i>" + repo.stargazerCount + "</p>";
    } else {
      html +="";
    }
    //Fork
    if(repo.forkCount > 0) {
      html += "<p class='forks countable-p'><i class='fas fa-code-branch countable-icon' style=''></i>" + repo.forkCount + "</p>";
    } else {
      html += "";
    }
    //License 
    if(repo.licenseInfo !== null) {
      html += `<p class= 'license'><svg class="octicon octicon-law mr-1" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8.75.75a.75.75 0 00-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 013.984 3H1.75a.75.75 0 000 1.5h.428L.066 9.192a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.514 3.514 0 00.686.45A4.492 4.492 0 003 11c.88 0 1.556-.22 2.023-.454a3.515 3.515 0 00.686-.45l.045-.04.016-.015.006-.006.002-.002.001-.002L5.25 9.5l.53.53a.75.75 0 00.154-.838L3.822 4.5h.162c.305 0 .604-.08.869-.23l1.289-.737a.25.25 0 01.124-.033h.984V13h-2.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-2.5V3.5h.984a.25.25 0 01.124.033l1.29.736c.264.152.563.231.868.231h.162l-2.112 4.692a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.002.002.006.006.016.015.045.04a3.517 3.517 0 00.686.45A4.492 4.492 0 0013 11c.88 0 1.556-.22 2.023-.454a3.512 3.512 0 00.686-.45l.045-.04.01-.01.006-.005.006-.006.002-.002.001-.002-.529-.531.53.53a.75.75 0 00.154-.838L13.823 4.5h.427a.75.75 0 000-1.5h-2.234a.25.25 0 01-.124-.033l-1.29-.736A1.75 1.75 0 009.735 2H8.75V.75zM1.695 9.227c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327l-1.305 2.9zm10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327l-1.305 2.9z"></path></svg>${repo.licenseInfo.name}</p>`;
    } else {
      html += "";
    }
    //Last update
    html += timeStamp(repo.updatedAt, updateTime);
    html += "</div>";
    html += "</div>";
    html+= "<button><i class='far fa-star'></i>Star</button>";
    html += "</div>";
    html += "</div>";
  });
  document.getElementById('repo').innerHTML = html;
 //log(html);
 //log(json);
  //log(repoData);
}) ();


//Responsive Navbar
function myFunction() {
  const navbar = document.getElementById("myNav");
  if (navbar.classList.contains("responsive")) {
    navbar.classList.remove("responsive");
    log('yeah');
    log(navbar.className);
  } else {
    log('Nah')
    navbar.classList.add("responsive");
  }
  log(navbar.className);
}
