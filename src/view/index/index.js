const naviLinks = Array.from(document.getElementsByClassName('nav_group_item'));
const contentEl = document.getElementById('main_pane')

// naviLinks.forEach((linkEl) => {
//   linkEl.addEventListener("click", e => {
//     e.preventDefault();
//     const href = linkEl.getAttribute("href");
//     if (href) {
//       const fs = require('fs');
//       const path = require('path');
//       fs.readFile(path.join(__dirname, href), (err, data) => {
//         if (err) {
//           throw err;
//         }
//         contentEl.innerHTML = "";
//         contentEl.insertAdjacentHTML("beforeend", data);
//       });
//     }
//   });
// });
