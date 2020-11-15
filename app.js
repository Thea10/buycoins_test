const { TOKEN } = require("./js/auth");

/* eslint-disable no-unused-vars */
async function getRepos() {
  let baseURL = "https://api.github.com/graphql";

  await fetch(baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      query: `{
        viewer {
          login
          repositories(affiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}, first: 20, privacy: PUBLIC) {
            edges {
              node {
                id
                updatedAt
                name
                stargazerCount
                primaryLanguage {
                    name
                    color
                  }
              }
            }
          }
          starredRepositories {
            totalCount
          }
        }
        user(login: "Thea10") {
            name
            repositories(orderBy: {field: UPDATED_AT, direction: ASC}) {
              totalCount
            }
          bio
          email
          avatarUrl
          following {
            totalCount
          }
          followers {
            totalCount
          }
        
        }
      }`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      populateData(data.data);
      document.getElementById("loading").classList.toggle("show");
      document.getElementById("main-body").classList.toggle("show");
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("error-message").textContent = error;
    });
}

function populateData(data) {
  let { viewer, user } = data;
  document
    .querySelectorAll(".avatar")
    .forEach((item) => (item.src = user.avatarUrl));
  document.getElementById("main-name").textContent = user.name;
  document.getElementById("name-alias").textContent = viewer.login;
  document.querySelector("#tab-link-profile span").textContent = viewer.login;
  document.getElementById("user-bio").textContent = user.bio;
  document.getElementById("user-email").textContent = user.email;
  document.getElementById("followers").textContent = user.followers.totalCount;
  document.getElementById("following").textContent = user.following.totalCount;
  document.querySelectorAll(".repo-count").forEach((item) => (item.textContent = viewer.repositories.edges.length));
  document.getElementById("gazers").textContent =
    viewer.starredRepositories.totalCount;

  let populate = viewer.repositories.edges.filter(edge => {return edge.node.primaryLanguage !== null});
  populate.forEach(item => {
      let details = item.node;
      let repoDetailHolder = document.createElement("div");
      repoDetailHolder.className = "repository-body-card d-flex justify-between";
      let repoDetails = `
      <div class="d-flex repo-details">
      <a href="#" class="repo-name"> ${details.name} </a>
  
      <div class="d-flex"> <span> <small class="repo-color" style='background-color: ${
        details.primaryLanguage.color
      }'></small> ${
      details.primaryLanguage.name
    } </span> <span> Updated  ${getDate(
      details.updatedAt
    )}</span> </div>
  
    </div>
  
    <button class="star d-flex"> <i class="fa fa-star-o"></i> <span>Star</span> </button>
      `;
     repoDetailHolder.innerHTML = repoDetails;
     document.getElementById('repository-body-cards').append(repoDetailHolder)


  })



}

function getDate(datestr) {
  let now = new Date().getTime();
  let dateString = new Date(datestr).getTime();
  let dateDifference = Math.abs(dateString - now);
  let dateUpdated = Math.round(parseFloat(dateDifference / (1000 * 60 * 60 * 24), 10));
   if(dateUpdated < 1){
     return `${ Math.round(parseFloat(dateDifference / (1000 * 60 * 60), 10))} hours ago`;
   } 

   if (dateUpdated > 20){
     return new Date(datestr).toDateString().substr(4,6);
   }
  return `${dateUpdated} days ago`;
}

getRepos();


