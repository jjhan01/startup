/**
  https://picsum.photos/
 */
function displayPicture(data) {
  const containerEl = document.querySelector("#picture");

  const width = containerEl.offsetWidth;
  const height = containerEl.offsetHeight;

  const imgUrl = `https://picsum.photos/id/${data[0].id}/${width}/${height}?grayscale`;
  const imgEl = document.createElement("img");
  imgEl.setAttribute("src", imgUrl);
  containerEl.appendChild(imgEl);
}

/**
  https://github.com/lukePeavey/quotable
 */
function displayQuote(data) {
  const containerEl = document.querySelector("#quote");

  const quoteEl = document.createElement("p");
  quoteEl.classList.add("quote");
  const authorEl = document.createElement("p");
  authorEl.classList.add("author");

  quoteEl.textContent = data.content;
  authorEl.textContent = data.author;

  containerEl.appendChild(quoteEl);
  containerEl.appendChild(authorEl);
}

function callService(url, displayCallback) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayCallback(data);
    });
}

const random = Math.floor(Math.random() * 1000);
callService(
  `https://picsum.photos/v2/list?page=${random}&limit=1`,
  displayPicture
);

//Final JavaScript
const generateQuote = function() {
  const quotes = [
  {
      quote: "Love people not things. Use things, not people.",
      author: "Spencer W. Kimball"
  },
  {
      quote: "The most important work that you and I will ever do will be within the walls of our own homes.",
      author: "Harold B. Lee"
  },
  {
      quote: "Life is fragile, handle with prayer.",
      author: "Harold B. Lee"
  },
  {
      quote: "Do your duty, that is best; leave unto the Lord the rest.",
      author: "David O. Mckay"
  },
  {
      quote: "What the world needs today more than anything else is an implicit faith in God, our Father, and in Jesus Christ, His Son, as the Redeemer of the world.",
      author: "Heber J. Grant"
  },
  {
      quote: "Do not expect to become perfect at once. If you do, you will be disappointed. Be better today than you were yesterday, and better tomorrow than you are today.",
      author: "Lorenzo Snow"
  },
  {
      quote: "Trust in God. Do your duty. Remember your prayers. Get faith in the Lord, and take hold and build up Zion. All will be right.",
      author: "Wilford Woodruff"
  },
  {
      quote: "Let us be pure, let us be virtuous, let us be honorable, let us maintain our integrity, let us do good to all men, and tell the truth always, and treat everybody right.",
      author: "John Taylor"
  },
  {
      quote: "If you have a bad thought about yourself, tell it to go to hell because that’s exactly where it came from."

      ,
      author: "Brigham Young"
  }
];

  let arrayIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quotes").innerHTML = quotes[arrayIndex].quote;
  document.getElementById("author").innerHTML = quotes[arrayIndex].author;

}
window.onload = function() {
  generateQuote();
  document.getElementById("generate").addEventListener('click', generateQuote);
}


