(function () {
  "use strict";

  const createEl = (el, style, innerText, className, placeholder) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    return element;
  };

  const settingsObj = JSON.parse(
    localStorage.getItem("settingsObjectCheckArtsBeforeBattle")
  );
  if (settingsObj === null) {
    localStorage.setItem(
      "settingsObjectCheckArtsBeforeBattle",
      JSON.stringify({ bag: true })
    );
    location.reload();
  }

  let dataFromSettingsObj = settingsObj.bag;

  let language = navigator.language;
  if (language) language = language.split("-")[0];

  const languages = ["ru", "en", "uk"];
  if (!languages.includes(language)) language = "en";

  const links = ["https://my.lordswm.com", "https://www.heroeswm.ru"];
  const link = location.href.includes("lordswm") ? links[0] : links[1];

  const fetch_xml = (el, path) => {
    const xhr = new XMLHttpRequest();
    xhr.open("get", `${link}/home.php`);
    xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/html; charset=windows-1251");
    }

    xhr.addEventListener("load", () => {
      var parser = new DOMParser();
      var doc = parser.parseFromString(xhr.responseText, "text/html");

      let equippedArtsCount = 0;
      const notEquipped = [];

      const head = {
        name: { en: "helmet", uk: "шолом", ru: "шлем" },
        check: doc.getElementById("slot1"),
      };
      const neck = {
        name: { en: "amulet", uk: "амулет", ru: "кулон" },
        check: doc.getElementById("slot2"),
      };
      const torso = {
        name: { en: "armor", uk: "броня", ru: "броня" },
        check: doc.getElementById("slot3"),
      };
      const back = {
        name: { en: "back", uk: "спина", ru: "спина" },
        check: doc.getElementById("slot4"),
      };
      const rHand = {
        name: { en: "right hand", uk: "права рука", ru: "правая рука" },
        check: doc.getElementById("slot5"),
      };
      const lHand = {
        name: { en: "left hand", uk: "ліва рука", ru: "левая рука" },
        check: doc.getElementById("slot6"),
      };
      const boots = {
        name: { en: "boots", uk: "ноги", ru: "сапоги" },
        check: doc.getElementById("slot7"),
      };
      const hRing = {
        name: { en: "first ring", uk: "перше кільце", ru: "первое кольцо" },
        check: doc.getElementById("slot8"),
      };
      const lRing = {
        name: { en: "second ring", uk: "друге кільце", ru: "второе кольцо" },
        check: doc.getElementById("slot9"),
      };
      const bag = {
        name: { en: "Bag", uk: "Сумка", ru: "Сумка" },
        check: doc.getElementById("slot10"),
      };
      const mirror = {
        name: { en: "Mirror", uk: "Дзеркало", ru: "Зеркало" },
        check: doc.getElementById("slot11"),
      };

      const mirrorInnerText = { en: "", uk: "", ru: "" };
      if (mirror.check.innerText == "") {
        mirrorInnerText.en = "Mirror is not equipped!";
        mirrorInnerText.uk = "Дзеркало не одягнуто!";
        mirrorInnerText.ru = "Зеркало не надето!";
      } else {
        mirrorInnerText.en = "Mirror is equipped";
        mirrorInnerText.uk = "Дзеркало одягнуто";
        mirrorInnerText.ru = "Зеркало надето";
      }

      const bagInnerText = { en: "", uk: "", ru: "" };
      if (bag.check.innerText == "") {
        bagInnerText.en = "Bag is not equipped!";
        bagInnerText.uk = "Сумку не одягнуто!";
        bagInnerText.ru = "Сумка не надета!";
      } else {
        bagInnerText.en = "Bag is equipped";
        bagInnerText.uk = "Сумку одягнуто";
        bagInnerText.ru = "Сумка надета";
      }

      const mainArtText = {
        en: "Equipped: ",
        uk: "Артів одягнуто: ",
        ru: "Артов надето: ",
      };
      const notEquippedArtText = {
        en: "Not equipped: ",
        uk: "Не одягнуто: ",
        ru: "Не надето: ",
      };

      const mirrorStyle =
        mirror.check.innerText == ""
          ? "color: red; font-size: 12px; cursor: pointer; font-weight: bold;"
          : "color: green;font-size: 12px; font-weight: bold;";
      const bagStyle =
        bag.check.innerText == ""
          ? "color: red;font-size: 12px; cursor: pointer; font-weight: bold"
          : "color: green;font-size: 12px; font-weight: bold";

      const arts = [head, neck, torso, back, rHand, lHand, boots, hRing, lRing];

      arts.forEach((art) => {
        if (art.check.innerText !== "") {
          equippedArtsCount += 1;
        } else {
          notEquipped.push(art.name[language]);
        }
      });

      const wrapper = createEl(
        "div",
        `${path === "event" ? "display: flex; gap: 5px" : ""}`
      );
      const mainArtsBlock = createEl(
        "div",
        `${
          equippedArtsCount < 9
            ? "color: red; cursor: pointer; font-size: 12px; font-weight: bold"
            : "color: green; font-size: 12px; font-weight: bold"
        }`,
        `${mainArtText[language]} ${equippedArtsCount}/9`
      );
      const notEquippedBlock = createEl(
        "div",
        "font-size: 12px; color: red; cursor: pointer; font-weight: bold",
        `${
          equippedArtsCount < 9
            ? `${notEquippedArtText[language]} ${notEquipped}`
            : ""
        }`
      );
      const mirrorBlock = createEl(
        "div",
        mirrorStyle,
        mirrorInnerText[language]
      );
      const bagBlock = createEl("div", bagStyle, bagInnerText[language]);
      bagBlock.style.display = dataFromSettingsObj ? "block" : "none";

      const settingsBlock = createEl("div", "cursor: pointer;", "👜");
      settingsBlock.addEventListener("click", () => {
        dataFromSettingsObj = !dataFromSettingsObj;
        bagBlock.style.display = dataFromSettingsObj ? "block" : "none";
        localStorage.setItem(
          "settingsObjectCheckArtsBeforeBattle",
          JSON.stringify({ bag: dataFromSettingsObj })
        );
      });

      wrapper.append(mainArtsBlock);
      wrapper.append(notEquippedBlock);
      wrapper.append(mirrorBlock);
      wrapper.append(bagBlock);
      wrapper.addEventListener("click", () => {
        location.href = `${link}/inventory.php`;
      });

      if (path === "event") {
        el.style.gap = "3px";
        el.style.display = "flex";
        el.innerHTML = "";
        el.append(wrapper);
        el.append(settingsBlock);
      } else if (path === "pvp_guild") {
        el.append(wrapper);
        el.append(settingsBlock);
      } else {
        el.append(wrapper);
        el.append(settingsBlock);
      }
    });
    xhr.send();
  };
  if (location.href.includes("pvp_guild")) {
    const gtElem = [...document.getElementsByClassName("gt_main")][0];
    fetch_xml(gtElem, "pvp_guild");
  }

  if (location.href.includes("event") || location.href.includes("hunt")) {
    const eventHeader = document.getElementsByClassName(
      "global_container_block_header"
    )[0];
    fetch_xml(eventHeader, "event");
  }
})();
