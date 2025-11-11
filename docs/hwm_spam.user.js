(function () {
  "use strict";
  const create_el = (el, style, innerText, className, placeholder) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    if (className) element.className = className;
    if (placeholder) element.placeholder = placeholder;
    return element;
  };

  const randomIntegerFunc = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const link = location.origin;

  //common styles
  const common_btn_style =
    "border: none; padding:5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #592c08; font-family: verdana,geneva,arial cyr; text-align: center; font-weight: 700; background: url(../i/homeico/art_btn_bg_gold.png) #dab761; background-size: 100% 100%; border-radius: 5px; box-shadow: inset 0 0 0 1px #fce6b0,inset 0 0 0 2px #a78750,0 0 0 1px rgba(0,0,0,.13); line-height: 25px; cursor: pointer; transition: -webkit-filter .15s;transition: filter .15s;";

  // local storage vars
  let spam_list = JSON.parse(localStorage.getItem("spam_list"));
  let subjectLS = JSON.parse(localStorage.getItem("subjectLS"));
  let msgLS = JSON.parse(localStorage.getItem("msgLS"));
  let timerLS = Number(JSON.parse(localStorage.getItem("timerLS")));
  let randomInteger = JSON.parse(localStorage.getItem("randomInteger"));
  let toogleStopSpam = JSON.parse(localStorage.getItem("toogleStopSpam"));
  let toogleStopSpamVar = toogleStopSpam;
  let isShowScriptLS = JSON.parse(localStorage.getItem("hwmSpamScriptToogle"));
  let isShowScript = isShowScriptLS;

  if (!spam_list) {
    localStorage.setItem("spam_list", JSON.stringify([]));
    location.reload();
  }
  if (randomInteger === null) {
    localStorage.setItem("randomInteger", JSON.stringify(false));
    location.reload();
  }
  if (!subjectLS) {
    localStorage.setItem("subjectLS", JSON.stringify("введите тему"));
    location.reload();
  }
  if (!msgLS) {
    localStorage.setItem("msgLS", JSON.stringify("введите сообщение"));
    location.reload();
  }
  if (!timerLS) {
    localStorage.setItem("timerLS", JSON.stringify(75000));
    location.reload();
  }
  if (toogleStopSpam === null) {
    localStorage.setItem("toogleStopSpam", JSON.stringify(false));
    location.reload();
  }
  if (!isShowScriptLS) {
    localStorage.setItem("hwmSpamScriptToogle", JSON.stringify(false));
  }

  // ui buttons

  let showScriptBtn = create_el(
    "button",
    `position: absolute; left: 10px; top: 2px; z-index: 999997; ${common_btn_style}`,
    `${isShowScript ? "Hide script" : "Show script"}`
  );

  let stopSpamBtn = create_el(
    "div",
    `position: absolute; left: 120px; top: 2px; z-index: 999997; ${common_btn_style}`,
    `${toogleStopSpam ? "Остановить спам" : "Продолжить спам"}`
  );

  let block = create_el(
    "div",
    "position: absolute; left: 10px; top: 40px; z-index: 999999; width: 400px; min-height: 50px; background: #f5f3ea; display: flex; flex-direction: column; align-items: center; padding: 5px;"
  );
  block.style.visibility = `${isShowScript ? "visible" : "hidden"}`;

  let addInputNicks = create_el(
    "input",
    "width: 400px; height: 50px; background: transparent; border: 1px solid black; color: black; font-size: 16px; margin-bottom: 3px;",
    "",
    "",
    "вставьте или введите никнеймы"
  );
  let addInputNicksBtn = create_el(
    "div",
    `${common_btn_style} width: 98%`,
    "добавить ники"
  );

  let timerBlock = create_el(
    "div",
    "display: flex; flex-direction: column; align-items: center; gap: 5px"
  );

  let timer = create_el("div", "color: black", `Таймер ${timerLS / 1000} сек`);

  let randomIntegerBtn = create_el(
    "div",
    `${common_btn_style} width: 98%`,
    `${
      randomInteger
        ? "Выключить рандом таймера +30 сек"
        : "Включить рандом таймера +30 сек"
    }`
  );
  randomIntegerBtn.style.background = randomInteger ? "#ff4d4d" : "#4dff88";
  randomIntegerBtn.title =
    "При включении рандома, таймер на сообщения будет в случайном порядке выбирать число между заданым Вами таймером и числом таймера, к которому добавлено 30 сек.";

  let setTimerInput = create_el(
    "input",
    "border: 1px solid black; width: 120px; height: 30px; background: transparent; color: black; border-radius: 10px; margin-top: 5px;",
    "",
    "",
    "введите таймер"
  );

  let setTimerBtn = create_el(
    "div",
    `${common_btn_style} width: 100%`,
    "задать таймер"
  );

  let subjectInput = create_el(
    "input",
    "width: 400px; height: 50px; background: transparent; border: 1px solid black; color: black; font-size: 16px; margin-bottom: 3px;",
    "",
    "",
    "введите тему"
  );
  subjectInput.value = subjectLS;
  let subjectInputBtn = create_el(
    "div",
    `${common_btn_style} width: 98%`,
    "добавить/изменить тему"
  );

  let msgInput = create_el(
    "textarea",
    "width: 400px; height: 150px; background: transparent; border: 1px solid black; black: white; font-size: 16px; margin-bottom: 3px;",
    "",
    "",
    "введите сообщение"
  );
  msgInput.value = msgLS;

  let addMessageBtn = create_el(
    "button",
    `${common_btn_style} margin: 5px; width: 100%`,
    "Добавить/изменить сообщение"
  );

  let uiList = create_el("ol");

  let deleteAllNicksBtn = create_el(
    "button",
    `${common_btn_style} margin: 5px; width: 100%`,
    "удалить весь список"
  );

  addInputNicksBtn.addEventListener("click", () => {
    let text = addInputNicks.value;
    text = text.split(",");
    text = text.filter((el) => el.length !== 0);
    text = text.map((el) => el.trim());
    spam_list = [...spam_list, ...text];
    localStorage.setItem("spam_list", JSON.stringify(spam_list));
    location.reload();
  });

  subjectInputBtn.addEventListener("click", (e) => {
    localStorage.setItem("subjectLS", JSON.stringify(subjectInput.value));
    location.reload();
  });

  deleteAllNicksBtn.addEventListener("click", () => {
    let conf = confirm("точно удалить весь список?");
    if (!conf) return;
    spam_list = [];
    localStorage.setItem("spam_list", JSON.stringify(spam_list));
    location.reload();
  });

  showScriptBtn.addEventListener("click", () => {
    isShowScript = !isShowScript;
    localStorage.setItem("hwmSpamScriptToogle", isShowScript);
    block.style.visibility = isShowScript ? "visible" : "hidden";
    showScriptBtn.innerText = `${isShowScript ? "Hide script" : "Show script"}`;
  });

  stopSpamBtn.addEventListener("click", () => {
    toogleStopSpamVar = !toogleStopSpamVar;
    localStorage.setItem("toogleStopSpam", toogleStopSpamVar);
    location.reload();
  });

  setTimerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      localStorage.setItem(
        "timerLS",
        JSON.stringify(Number(setTimerInput.value) * 1000)
      );
      location.reload();
    }
  });

  setTimerBtn.addEventListener("click", (e) => {
    localStorage.setItem(
      "timerLS",
      JSON.stringify(Number(setTimerInput.value) * 1000)
    );
    location.reload();
  });

  subjectInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      localStorage.setItem("subjectLS", JSON.stringify(subjectInput.value));
      location.reload();
    }
  });

  addMessageBtn.addEventListener("click", () => {
    localStorage.setItem("msgLS", JSON.stringify(msgInput.value));
    location.reload();
  });

  addInputNicks.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      let text = addInputNicks.value;
      text = text.split(",");
      text = text.filter((el) => el.length !== 0);
      text = text.map((el) => el.trim());
      spam_list = [...spam_list, ...text];
      localStorage.setItem("spam_list", JSON.stringify(spam_list));
      location.reload();
    }
  });

  randomIntegerBtn.addEventListener("click", () => {
    randomInteger = !randomInteger;
    localStorage.setItem("randomInteger", JSON.stringify(randomInteger));
    randomIntegerBtn.innerText = randomInteger
      ? "Выключить рандом таймера +30 сек"
      : "Включить рандом таймера +30 сек";
    randomIntegerBtn.style.background = randomInteger ? "#ff4d4d" : "#4dff88";
  });

  spam_list.forEach((el) => {
    let li = create_el("li");
    let nickname = create_el("span", "color: black;", el);
    let deleteNickBtn = create_el(
      "button",
      "cursor: pointer; margin-left: 5px; background-color: transparent; border: none;",
      "χ"
    );
    deleteNickBtn.addEventListener("click", () => {
      spam_list = spam_list.filter((nick) => nick !== el);
      localStorage.setItem("spam_list", JSON.stringify(spam_list));
      location.reload();
    });
    li.appendChild(nickname);
    li.appendChild(deleteNickBtn);
    uiList.appendChild(li);
  });
  timerBlock.appendChild(setTimerInput);
  timerBlock.appendChild(setTimerBtn);
  timerBlock.appendChild(timer);

  block.appendChild(addInputNicks);
  block.appendChild(addInputNicksBtn);
  block.appendChild(subjectInput);
  block.appendChild(subjectInputBtn);
  block.appendChild(msgInput);
  block.appendChild(addMessageBtn);
  block.appendChild(deleteAllNicksBtn);
  block.appendChild(randomIntegerBtn);
  block.appendChild(timerBlock);
  block.appendChild(uiList);

  document.body.appendChild(showScriptBtn);
  document.body.appendChild(stopSpamBtn);
  document.body.appendChild(block);

  if (toogleStopSpam === false) return;

  if (location.href === `${link}/sms.php`) {
    if (spam_list.length === 0) return;
    location.replace(`${link}/sms-create.php`);
  }

  if (location.href === `${link}/sms-create.php`) {
    if (spam_list.length === 0) return;
    let nickInput = (document.getElementsByName("mailto")[0].value =
      spam_list[0]);

    let subjectInput = (document.getElementsByName("subject")[0].value =
      subjectLS);

    let msgInput = (document.getElementsByName("msg")[0].value = msgLS);

    setTimeout(
      () => {
        spam_list.shift();
        localStorage.setItem("spam_list", JSON.stringify(spam_list));
        let submitBtn = document.getElementsByName("subm")[0].click();
      },
      randomInteger ? randomIntegerFunc(timerLS, timerLS + 30000) : timerLS
    );
  }
})();
