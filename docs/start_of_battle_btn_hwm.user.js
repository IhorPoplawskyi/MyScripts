(function () {
  "use strict";
  const createEl = (el, style, innerText) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    return element;
  };
  const common_btn_style =
    "border: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #592c08; font-family: verdana,geneva,arial cyr; position: relative; text-align: center; font-weight: 700; background: url(../i/homeico/art_btn_bg_gold.png) #dab761; background-size: 100% 100%; border-radius: 5px; box-shadow: inset 0 0 0 1px #fce6b0,inset 0 0 0 2px #a78750,0 0 0 1px rgba(0,0,0,.13); line-height: 25px; cursor: pointer; transition: -webkit-filter .15s;transition: filter .15s;";

  let copyListLS = JSON.parse(localStorage.getItem("copyListLS"));
  if (copyListLS === null)
    localStorage.setItem("copyListLS", JSON.stringify([]));
  var queryParam = "?lt=-1&";

  var global_elem = document.getElementsByClassName("global_a_hover")[1];
  global_elem.style.position = "relative";
  var list = global_elem.innerHTML.split("\n&nbsp;&nbsp;");
  list.shift();
  var links = [...global_elem.getElementsByTagName("a")];
  links = links.filter((el) => !el.classList.contains("pi"));
  links = links.map((link) => link.href);
  links = links.filter((link) => link.includes("warlog.php"));
  links = links.map((link) => link.split("?"));
  links.map((link) => link.splice(1, 0, queryParam));
  links = links.map((link) => link.join(""));
  global_elem.innerText = "";
  let copyList = copyListLS;
  let copyBlock = createEl(
    "textarea",
    "width: 500px; min-height: 100px; display: none;"
  );
  let panel = createEl("div", "display: flex");
  let copySelectedBtn = createEl(
    "div",
    `${common_btn_style} width: 110px; height: 25px;`,
    "Copy selected"
  );
  let clearCopyListBtn = createEl(
    "div",
    `${common_btn_style} width: 130px; height: 25px;`,
    "Clear selected list"
  );
  clearCopyListBtn.addEventListener("click", () => {
    copyList = [];
    localStorage.setItem("copyListLS", JSON.stringify(copyList));
    copiedListCount.innerText = `copied: ${copyList.length}`;
  });
  let copiedListCount = createEl(
    "div",
    `${common_btn_style} width: 110px; height: 25px;`,
    `copied: ${copyList.length}`
  );
  panel.append(copySelectedBtn);
  panel.append(clearCopyListBtn);
  panel.append(copiedListCount);
  let copiedPopup = createEl(
    "div",
    "position: absolute; left: 0; right: 0; top: 100; margin-inline: auto; width: fit-content; font-wight: bold; font-size: 18px",
    "Successfully copied ✅"
  );
  copiedPopup.id = "copiedPopup";
  copySelectedBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(copyBlock.innerText);
    global_elem.append(copiedPopup);
    setTimeout(() => {
      document.getElementById("copiedPopup").remove();
    }, 1000);
  });
  global_elem.append(panel);

  for (let i = 0; i < list.length; i++) {
    let listItem = document.createElement("div");
    let copyBtn = createEl("div", "cursor: pointer", "🏴");
    copyBtn.addEventListener("click", () => {
      if (copyList.includes(links[i] + "\n")) {
        listItem.style.background = "none";
        copyBtn.style.background = "none";
        copyList = copyList.filter((link) => link !== links[i] + "\n");
      } else {
        listItem.style.background = "wheat";
        copyBtn.style.background = "wheat";
        copyList.push(links[i] + "\n");
      }
      localStorage.setItem("copyListLS", JSON.stringify(copyList));
      let text = "";
      copyList.forEach((el, i) => {
        text += `${i + 1}. ${el}`;
      });
      copyBlock.innerHTML = text;
      copiedListCount.innerText = `copied: ${copyList.length}`;
    });
    let btn = createEl("a", "");
    btn.innerHTML = `<a href=${links[i]} target='_blank'>###</a>`;
    let block = createEl("div", "display: flex; gap: 4px;", "");
    listItem.innerHTML = list[i];
    block.append(copyBtn);
    block.append(btn);
    block.append(listItem);
    global_elem.append(block);
  }

  global_elem.append(copyBlock);
})();
