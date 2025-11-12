(function () {
  "use strict";

  //common
  const createEl = (el, style, innerText, placeholder, className) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    if (placeholder) element.placeholder = placeholder;
    if (className) element.className = className;
    return element;
  };

  let toogleRepair = JSON.parse(localStorage.getItem("toogleRepair"));
  if (toogleRepair === null)
    localStorage.setItem("toogleRepair", JSON.stringify(false));

  const toogle = createEl(
    "div",
    "margin: 7px",
    `${toogleRepair === false ? "Auto repair off" : "Auto repair on"}`,
    "",
    "btn_standard inv_cut_text  btn_txt_hover"
  );
  toogle.addEventListener("click", () => {
    localStorage.setItem("toogleRepair", JSON.stringify(!toogleRepair));
    location.reload();
  });

  //common constants
  const link = location.origin;

  //checking if there some arts to repair
  const checkRepairs = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("get", `${link}/inventory.php`);
    xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/html; charset=windows-1251");
    }

    xhr.addEventListener("load", () => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(xhr.responseText, "text/html");
      const peredachki = [...doc.querySelectorAll(".inv_peredachka")];
      if (peredachki.length > 0) location.href = `${link}/inventory.php`;
    });
    xhr.send();
  };

  //code for workbench
  if (location.href.includes(`${link}/mod_workbench.php`)) {
    if (toogleRepair === false) return;
    console.log(toogleRepair);

    let element = document.getElementsByClassName("wbwhite")[2];
    if (element === undefined) {
      checkRepairs();
    }
    setInterval(() => {
      location.reload();
    }, 180000);
  }

  //code for inventory
  if (location.href === `${link}/inventory.php`) {
    //Local storage settings
    let friendsListRepair = JSON.parse(
      localStorage.getItem("friendsListRepair")
    );
    if (friendsListRepair === null)
      localStorage.setItem("friendsListRepair", JSON.stringify([]));

    let wageRepair = JSON.parse(localStorage.getItem("wageRepair"));
    if (wageRepair === null) {
      localStorage.setItem("wageRepair", JSON.stringify(101));
      location.reload();
    }

    //UI
    const uiBlock = document.getElementsByClassName("container_block")[0];

    const repairMenu = createEl("div", "", "", "", "inv_note_kukla");

    //wage UI block
    const wageBlock = createEl(
      "div",
      "display: flex; gap: 3px; padding: 10px;",
      "",
      "",
      "inv_note_kukla"
    );
    const wageInput = createEl(
      "input",
      "",
      "",
      "change wage here",
      "divs_inline"
    );
    wageInput.addEventListener("input", () => {
      wage.innerText = `wage: ${wageInput.value}`;
      localStorage.setItem("wageRepair", wageInput.value);
      wageRepair = Number(wageInput.value);
    });
    const wage = createEl(
      "div",
      "height: 30px",
      `wage: ${wageRepair | 101}`,
      "",
      "btn_standard inv_cut_text  btn_txt_hover"
    );
    wageBlock.appendChild(wageInput);
    wageBlock.appendChild(wage);

    //create friends helper
    const createFriend = (bro) => {
      const friend = createEl("li", "display: flex; gap: 3px", bro);
      const deleteFriendBtn = createEl("div", "cursor: pointer", "✘");
      deleteFriendBtn.addEventListener("click", () => {
        friendsListRepair = friendsListRepair.filter((el) => el !== bro);
        localStorage.setItem(
          "friendsListRepair",
          JSON.stringify(friendsListRepair)
        );
        friend.remove();
      });
      friend.appendChild(deleteFriendBtn);
      return friend;
    };

    //friends UI block
    const friendsList = createEl("ul", "", "Friends list");
    for (let i = 0; i < friendsListRepair.length; i++) {
      friendsList.appendChild(createFriend(friendsListRepair[i]));
    }

    const addFriendBlock = createEl("div", "display: flex; padding: 10px;");
    const addFriendsInput = createEl(
      "input",
      "",
      "",
      "Friend nickname",
      "divs_inline"
    );
    const addFriendsBtn = createEl(
      "div",
      "height: 30px;",
      "ADD",
      "",
      "btn_standard inv_cut_text  btn_txt_hover"
    );
    addFriendsBtn.addEventListener("click", () => {
      let val = addFriendsInput.value;
      val = val.split(",");
      val.forEach((val) => {
        friendsListRepair.push(val);
        friendsList.appendChild(createFriend(val));
        localStorage.setItem(
          "friendsListRepair",
          JSON.stringify(friendsListRepair)
        );
      });
      addFriendsInput.value = "";
    });
    addFriendBlock.appendChild(addFriendsInput);
    addFriendBlock.appendChild(addFriendsBtn);

    //merging UI
    repairMenu.appendChild(addFriendBlock);
    repairMenu.appendChild(friendsList);
    uiBlock.appendChild(toogle);
    uiBlock.appendChild(wageBlock);
    uiBlock.appendChild(repairMenu);

    //repair settings
    const allTradesToMe = document.getElementById("all_trades_to_me");
    let peredachki;
    if (allTradesToMe) {
      peredachki = [...allTradesToMe.getElementsByClassName("inv_peredachka")];
      peredachki = peredachki.filter((peredachka) =>
        peredachka.innerText.includes("%")
      );
    }

    const repairItem = () => {
      if (peredachki) {
        let item = peredachki[0];
        let charNick = item.getElementsByTagName("a")[0].innerText;
        let percent = Number(
          item
            .getElementsByClassName("inv_request_info")[0]
            .innerText.match(/\d+%/gi)[0]
            .replace("%", "")
        );
        let buttons = item.getElementsByClassName("inv_buttons_to_right ");
        let denyRepair = () => {
          buttons[0].children[1].firstChild.click();
        };
        let acceptRepair = () => {
          buttons[0].children[0].click();
          let confirm = document.getElementsByClassName("confirm")[0].click();
        };

        if (friendsListRepair.includes(charNick) && percent >= 100) {
          acceptRepair();
        } else if (
          !friendsListRepair.includes(charNick) &&
          percent >= Number(wageRepair | 101)
        ) {
          acceptRepair();
        } else {
          denyRepair();
        }
      } else {
        setInterval(() => {
          location.reload();
        }, 180000);
      }
    };
    if (toogleRepair === true) repairItem();
  }
})();
