(function () {
  "use strict";

  //My sign block code
  let myCode = localStorage.getItem("myCode");
  let currentId = document.cookie.match(/pl_id=\d*/gi).join("");
  let myId = localStorage.getItem("myId");

  if (!myId) {
    localStorage.setItem("myId", currentId);
    location.reload();
  }

  let link = location.origin;

  let fetchCode = async () => {
    fetch(`${link}/castle.php?show_castle_f=1`)
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var element = doc
          .getElementsByClassName("castle_yes_no_buttons")[0]
          .getElementsByTagName("a")[0].href;
        var code = element.slice(-32);
        var plId = document.cookie.match(/pl_id=\d*/gi);
        localStorage.setItem("myCode", code);
      })
      .catch(function (err) {});
  };
  if (!myCode) fetchCode();

  if (myId !== currentId) {
    fetchCode();
    localStorage.setItem("myId", currentId);
  }

  let DMap = {
    1027: 129,
    8225: 135,
    1046: 198,
    8222: 132,
    1047: 199,
    1168: 165,
    1048: 200,
    1113: 154,
    1049: 201,
    1045: 197,
    1050: 202,
    1028: 170,
    160: 160,
    1040: 192,
    1051: 203,
    164: 164,
    166: 166,
    167: 167,
    169: 169,
    171: 171,
    172: 172,
    173: 173,
    174: 174,
    1053: 205,
    176: 176,
    177: 177,
    1114: 156,
    181: 181,
    182: 182,
    183: 183,
    8221: 148,
    187: 187,
    1029: 189,
    1056: 208,
    1057: 209,
    1058: 210,
    8364: 136,
    1112: 188,
    1115: 158,
    1059: 211,
    1060: 212,
    1030: 178,
    1061: 213,
    1062: 214,
    1063: 215,
    1116: 157,
    1064: 216,
    1065: 217,
    1031: 175,
    1066: 218,
    1067: 219,
    1068: 220,
    1069: 221,
    1070: 222,
    1032: 163,
    8226: 149,
    1071: 223,
    1072: 224,
    8482: 153,
    1073: 225,
    8240: 137,
    1118: 162,
    1074: 226,
    1110: 179,
    8230: 133,
    1075: 227,
    1033: 138,
    1076: 228,
    1077: 229,
    8211: 150,
    1078: 230,
    1119: 159,
    1079: 231,
    1042: 194,
    1080: 232,
    1034: 140,
    1025: 168,
    1081: 233,
    1082: 234,
    8212: 151,
    1083: 235,
    1169: 180,
    1084: 236,
    1052: 204,
    1085: 237,
    1035: 142,
    1086: 238,
    1087: 239,
    1088: 240,
    1089: 241,
    1090: 242,
    1036: 141,
    1041: 193,
    1091: 243,
    1092: 244,
    8224: 134,
    1093: 245,
    8470: 185,
    1094: 246,
    1054: 206,
    1095: 247,
    1096: 248,
    8249: 139,
    1097: 249,
    1098: 250,
    1044: 196,
    1099: 251,
    1111: 191,
    1055: 207,
    1100: 252,
    1038: 161,
    8220: 147,
    1101: 253,
    8250: 155,
    1102: 254,
    8216: 145,
    1103: 255,
    1043: 195,
    1105: 184,
    1039: 143,
    1026: 128,
    1106: 144,
    8218: 130,
    1107: 131,
    8217: 146,
    1108: 186,
    1109: 190,
  };
  for (let j = 0; j < 128; j++) {
    DMap[j] = j;
  }

  function UnicodeToWin1251(t) {
    for (var e = [], r = 0; r < t.length; r++) {
      var n = t.charCodeAt(r);
      if (!(n in DMap)) throw "e";
      e.push(String.fromCharCode(DMap[n]));
    }
    return e.join("");
  }

  function getSendArray(body) {
    let converted_str = UnicodeToWin1251(body);
    let send_arr = new Uint8Array(converted_str.length);
    for (let x = 0; x < converted_str.length; ++x) {
      send_arr[x] = converted_str.charCodeAt(x);
    }
    return send_arr;
  }

  //Common styles
  let styleGray =
    "min-width: 175px;color: #fad49f;padding: .5em;margin: 5px 8px;text-align: center;background-color: #696969;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px;transition-duration: .1s;-webkit-transition-duration: .1s;-moz-transition-duration: .1s;-o-transition-duration: .1s;-ms-transition-duration: .1s;box-shadow: inset 0 0 0 1px #e2b77d,inset 0 0 4px rgba(0,0,0,.5),inset 0 -13px 5px rgba(0,0,0,.4),0 1px 7px rgba(0,0,0,.7);text-shadow: 0 0 5px #000,0 0 3px #000;";
  let btnSendAllStyle =
    "border: none;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;color: #592c08;font-family: verdana,geneva,arial cyr;position: relative;text-align: center;font-weight: 700;background: url(../i/homeico/art_btn_bg_gold.png) #dab761;background-size: 100% 100%;border-radius: 5px;box-shadow: inset 0 0 0 1px #fce6b0, inset 0 0 0 2px #a78750, 0 0 0 1px rgba(0,0,0,.13);line-height: 25px;cursor: pointer;transition: -webkit-filter .15s;transition: filter .15s;";
  let displayElemStyle =
    "padding-left: 4px; padding-right: 4px; font-weight: bold;";

  const createEl = (el, style, innerText, placeholder, type, value) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    if (placeholder) element.placeholder = placeholder;
    if (type) element.type = type;
    if (value) element.value = value;
    return element;
  };

  if (
    location.href === "https://my.lordswm.com/el_transfer.php" ||
    location.href === "https://www.heroeswm.ru/el_transfer.php"
  ) {
    //elements block
    let elements = [...document.getElementsByName("eltype")[0].options];
    elements.shift();

    //UI
    let parentTable = document.getElementsByTagName("table")[1];
    let container = createEl(
      "div",
      "display: flex; justify-content: center; width: 970px; text-align: center;"
    );
    let panel = createEl(
      "div",
      "display: flex; flex-direction: column; width: 200px;"
    );
    let selectedElements = createEl(
      "div",
      "display: flex; flex-direction: column; width: 400px;"
    );
    selectedElements.id = "selectedElements";

    let nickInput = createEl("input", styleGray, "", "NICK", "text");
    let selectType = createEl("select", styleGray);
    elements.forEach((el) => {
      let option = createEl("option", "", el.innerText, "", "", el.value);
      selectType.appendChild(option);
    });
    let amountInput = createEl("input", styleGray, "", "AMOUNT", "text");
    let priceInput = createEl("input", styleGray, "", "PRICE", "text");
    let addElemBtn = createEl("button", `${styleGray} cursor: pointer;`, "ADD");

    let elementsToSend = [];

    addElemBtn.addEventListener("click", () => {
      if (!nickInput.value) {
        alert("Enter a nickname");
        return;
      }
      if (!amountInput.value) {
        alert("Enter an amount");
        return;
      }

      let id = Date.now();

      elementsToSend.push({
        id,
        nick: nickInput.value,
        eltype: selectType.value,
        count: amountInput.value,
        gold: priceInput.value || 0,
        comment: "",
        sendtype: "1",
        art_id: "",
        sign: myCode,
      });

      let selectedElement = createEl("div", "display: flex;");
      let nick = createEl("div", displayElemStyle, `${nickInput.value}`);
      let type = createEl(
        "div",
        `${displayElemStyle} width: 55%`,
        `${[...selectType.options]
          .filter((el) => el.selected === true)[0]
          .innerText.replace(/\(\d+\)/gi, "")
          .trim()}`
      );
      let amount = createEl("div", displayElemStyle, `(${amountInput.value})`);
      let price = createEl("div", displayElemStyle, `${priceInput.value || 0}`);
      let goldImg = createEl("img", "height: 18px; width: 18px");
      goldImg.src = "https://cfcdn.lordswm.com/i/r/48/gold.png?v=3.23de65";
      let delBtn = createEl(
        "div",
        `${displayElemStyle}; cursor: pointer;`,
        "X"
      );

      delBtn.addEventListener("click", () => {
        elementsToSend = elementsToSend.filter((el) => el.id !== id);
        selectedElement.remove();
      });

      selectedElement.appendChild(nick);
      selectedElement.appendChild(type);
      selectedElement.appendChild(amount);
      selectedElement.appendChild(goldImg);
      selectedElement.appendChild(price);
      selectedElement.appendChild(delBtn);
      selectedElements.appendChild(selectedElement);
    });

    let sendAllBtn = createEl("button", btnSendAllStyle, "SEND");

    sendAllBtn.addEventListener("click", () => {
      let conf = confirm("Send?");
      if (!conf) return;
      elementsToSend.forEach((el, index) => {
        function sendElements(formData) {
          let http = new XMLHttpRequest();
          http.open("POST", "/el_transfer.php", !0);
          http.setRequestHeader(
            "Content-type",
            "application/x-www-form-urlencoded"
          );
          http.setRequestHeader(
            "Content-Type",
            "text/plain; charset=windows-1251"
          );
          http.send(formData);
          http.onload = () => {
            let children = document.getElementById("selectedElements").children;
            let okay = createEl("div", "", "✔");
            children[index].appendChild(okay);
          };
          http.onerror = () => {
            let children = document.getElementById("selectedElements").children;
            let error = createEl("div", "", "✘");
            children[index].appendChild(error);
          };
        }

        function sendFormData() {
          let form = new FormData();
          form.append("nick", el.nick);
          form.append("eltype", el.eltype);
          form.append("count", el.count);
          form.append("gold", el.gold);
          form.append("comment", el.comment);
          form.append("sendtype", "1");
          form.append("art_id", "");
          form.append("sign", el.sign);
          const data = [...form.entries()];
          return data.map((x) => `${x[0]}=${x[1]}`).join("&");
        }

        sendElements(getSendArray(sendFormData()));
      });
    });

    panel.appendChild(selectType);
    panel.appendChild(nickInput);
    panel.appendChild(amountInput);
    panel.appendChild(priceInput);
    panel.appendChild(addElemBtn);
    panel.appendChild(sendAllBtn);
    container.appendChild(panel);
    container.appendChild(selectedElements);
    parentTable.appendChild(container);
  }

  if (
    location.href === "https://my.lordswm.com/transfer.php" ||
    location.href === "https://www.heroeswm.ru/transfer.php"
  ) {
    let table = document.getElementsByTagName("table")[1];
    let panel = createEl(
      "div",
      "display: flex; flex-direction: column; width: 200px;"
    );
    let container = createEl(
      "div",
      "position: absolute; display:flex; top: 133px;left: 37.5%; width: 700px; text-align: center;"
    );
    let selectedElements = createEl(
      "div",
      "display: flex; flex-direction: column; width: 100%;"
    );
    selectedElements.id = "selectedElements";
    let nickInput = createEl("input", styleGray, "", "NICK", "text");
    let goldInput = createEl("input", styleGray, "", "GOLD | ЗОЛОТО", "text");
    let woodInput = createEl("input", styleGray, "", "WOOD | ДЕРЕВО", "text");
    let oreInput = createEl("input", styleGray, "", "ORE | РУДА", "text");
    let mercuryInput = createEl(
      "input",
      styleGray,
      "",
      "MERCURY | РТУТЬ",
      "text"
    );
    let sulphurInput = createEl(
      "input",
      styleGray,
      "",
      "SULPHUR | СЕРА",
      "text"
    );
    let crystalInput = createEl(
      "input",
      styleGray,
      "",
      "CRYSTAL | КРИСТАЛЛ",
      "text"
    );
    let gemInput = createEl("input", styleGray, "", "GEM | САМОЦВЕТ", "text");
    let textInput = createEl("input", styleGray, "", "TEXT", "text");
    let addHeroBtn = createEl("button", `${styleGray} cursor: pointer;`, "ADD");

    let elementsToSend = [];

    addHeroBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (!nickInput.value) {
        alert("Enter a nickname");
        return;
      }

      let id = Date.now();

      elementsToSend.push({
        id,
        nick: nickInput.value,
        gold: goldInput.value || 0,
        wood: woodInput.value || 0,
        ore: oreInput.value || 0,
        mercury: mercuryInput.value || 0,
        sulphur: sulphurInput.value || 0,
        crystal: crystalInput.value || 0,
        gem: gemInput.value || 0,
        desc: textInput.value || "",
        sign: myCode,
      });

      let selectedElement = createEl("div", "display: flex;");
      let nick = createEl("div", displayElemStyle, `${nickInput.value}`);
      let gold = createEl("div", displayElemStyle, `${goldInput.value || 0}`);
      let wood = createEl("div", displayElemStyle, `${woodInput.value || 0}`);
      let ore = createEl("div", displayElemStyle, `${oreInput.value || 0}`);
      let mercury = createEl(
        "div",
        displayElemStyle,
        `${mercuryInput.value || 0}`
      );
      let sulphur = createEl(
        "div",
        displayElemStyle,
        `${sulphurInput.value || 0}`
      );
      let crystal = createEl(
        "div",
        displayElemStyle,
        `${crystalInput.value || 0}`
      );
      let gem = createEl("div", displayElemStyle, `${gemInput.value || 0}`);
      let text = createEl("div", displayElemStyle, `${textInput.value || ""}`);
      let goldImg = createEl("img", "height: 18px; width: 18px");
      goldImg.src = "https://cfcdn.lordswm.com/i/r/48/gold.png?v=3.23de65";
      let woodImg = createEl("img", "height: 18px; width: 18px");
      woodImg.src = "https://cfcdn.lordswm.com/i/r/48/wood.png?v=3.23de65";
      let oreImg = createEl("img", "height: 18px; width: 18px");
      oreImg.src = "https://cfcdn.lordswm.com/i/r/48/ore.png?v=3.23de65";
      let mercuryImg = createEl("img", "height: 18px; width: 18px");
      mercuryImg.src =
        "https://cfcdn.lordswm.com/i/r/48/mercury.png?v=3.23de65";
      let sulphurImg = createEl("img", "height: 18px; width: 18px");
      sulphurImg.src = "https://cfcdn.lordswm.com/i/r/48/sulfur.png?v=3.23de65";
      let crystalImg = createEl("img", "height: 18px; width: 18px");
      crystalImg.src =
        "https://cfcdn.lordswm.com/i/r/48/crystals.png?v=3.23de65";
      let gemImg = createEl("img", "height: 18px; width: 18px");
      gemImg.src = "https://cfcdn.lordswm.com/i/r/48/gems.png?v=3.23de65";
      let delBtn = createEl(
        "div",
        `${displayElemStyle}; cursor: pointer;`,
        "X"
      );

      delBtn.addEventListener("click", () => {
        elementsToSend = elementsToSend.filter((el) => el.id !== id);
        selectedElement.remove();
      });

      selectedElement.appendChild(nick);
      selectedElement.appendChild(goldImg);
      selectedElement.appendChild(gold);
      selectedElement.appendChild(woodImg);
      selectedElement.appendChild(wood);
      selectedElement.appendChild(oreImg);
      selectedElement.appendChild(ore);
      selectedElement.appendChild(mercuryImg);
      selectedElement.appendChild(mercury);
      selectedElement.appendChild(sulphurImg);
      selectedElement.appendChild(sulphur);
      selectedElement.appendChild(crystalImg);
      selectedElement.appendChild(crystal);
      selectedElement.appendChild(gemImg);
      selectedElement.appendChild(gem);
      selectedElement.appendChild(text);
      selectedElement.appendChild(delBtn);

      selectedElements.appendChild(selectedElement);
    });

    let sendAllBtn = createEl("button", btnSendAllStyle, "SEND | ОТПРАВИТЬ");

    sendAllBtn.addEventListener("click", (e) => {
      e.preventDefault();
      let conf = confirm("Send?");
      if (!conf) return;
      elementsToSend.forEach((el, index) => {
        function sendResources(formData) {
          let http = new XMLHttpRequest();
          http.open("POST", "/transfer.php", !0);
          http.setRequestHeader(
            "Content-type",
            "application/x-www-form-urlencoded"
          );
          http.setRequestHeader(
            "Content-Type",
            "text/plain; charset=windows-1251"
          );
          http.send(formData);
          http.onload = () => {
            let children = document.getElementById("selectedElements").children;
            let okay = createEl("div", "", "✔");
            children[index].appendChild(okay);
          };
          http.onerror = () => {
            let children = document.getElementById("selectedElements").children;
            let error = createEl("div", "", "✘");
            children[index].appendChild(error);
          };
        }

        function sendFormData() {
          let form = new FormData();
          form.append("nick", el.nick);
          form.append("gold", el.gold);
          form.append("wood", el.wood);
          form.append("ore", el.ore);
          form.append("mercury", el.mercury);
          form.append("sulphur", el.sulphur);
          form.append("crystal", el.crystal);
          form.append("gem", el.gem);
          form.append("desc", el.desc);
          form.append("sign", el.sign);
          const data = [...form.entries()];
          return data.map((x) => `${x[0]}=${x[1]}`).join("&");
        }

        sendResources(getSendArray(sendFormData()));
      });
    });

    panel.appendChild(nickInput);
    panel.appendChild(goldInput);
    panel.appendChild(woodInput);
    panel.appendChild(oreInput);
    panel.appendChild(mercuryInput);
    panel.appendChild(sulphurInput);
    panel.appendChild(crystalInput);
    panel.appendChild(gemInput);
    panel.appendChild(textInput);
    panel.appendChild(addHeroBtn);
    panel.appendChild(sendAllBtn);

    container.appendChild(panel);
    container.appendChild(selectedElements);
    table.appendChild(container);
  }
})();
