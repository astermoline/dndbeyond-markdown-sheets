const fs = require('fs');

const url = "https://character-service.dndbeyond.com/character/v5/character/131447412";

console.log("Fetching character JSON...");
fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
})
.then(res => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
})
.then(data => {
  fs.writeFileSync("char_pretty.json", JSON.stringify(data, null, 2), "utf-8");
  console.log("Success! Wrote char_pretty.json");
})
.catch(err => {
  console.error("Error:", err);
});
